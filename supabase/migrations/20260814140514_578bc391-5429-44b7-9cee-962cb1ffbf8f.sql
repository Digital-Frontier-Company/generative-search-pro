create table if not exists public.sampling_batches (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  panel_id uuid not null references public.prompt_panels(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','cancelled')),
  total_jobs int not null default 0,
  completed_jobs int not null default 0,
  failed_jobs int not null default 0,
  replicates int not null default 1,
  models jsonb not null default '[]'::jsonb,
  trace_id text,
  created_by uuid,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  last_heartbeat_at timestamptz
);

create table if not exists public.sampling_jobs (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.sampling_batches(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  model text not null,
  replicate_idx int not null default 0,
  status text not null default 'pending' check (status in ('pending','claimed','done','error')),
  attempts int not null default 0,
  worker text,
  error text,
  claimed_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists sampling_jobs_pending_idx on public.sampling_jobs (batch_id) where status = 'pending';
create index if not exists sampling_jobs_batch_status_idx on public.sampling_jobs (batch_id, status);
create index if not exists sampling_jobs_claimed_idx on public.sampling_jobs (claimed_at) where status = 'claimed';
create index if not exists sampling_batches_panel_idx on public.sampling_batches (panel_id, created_at desc);
create index if not exists sampling_batches_open_idx on public.sampling_batches (status) where status in ('queued','running');

grant select on public.sampling_batches to authenticated;
grant select on public.sampling_jobs to authenticated;
grant all on public.sampling_batches to service_role;
grant all on public.sampling_jobs to service_role;

alter table public.sampling_batches enable row level security;
alter table public.sampling_jobs enable row level security;

drop policy if exists sampling_batches_account_read on public.sampling_batches;
create policy sampling_batches_account_read on public.sampling_batches
  for select to authenticated
  using (account_id in (select public.current_account_ids()));

drop policy if exists sampling_jobs_account_read on public.sampling_jobs;
create policy sampling_jobs_account_read on public.sampling_jobs
  for select to authenticated
  using (exists (
    select 1 from public.sampling_batches b
    where b.id = sampling_jobs.batch_id
      and b.account_id in (select public.current_account_ids())
  ));

-- Claim a chunk of pending work. SKIP LOCKED lets several workers drain the
-- same batch without ever handing the same job to two of them.
create or replace function public.claim_sampling_jobs(p_batch uuid, p_limit int, p_worker text)
returns table (job_id uuid, prompt_id uuid, model text, replicate_idx int, attempts int)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with picked as (
    select j.id
    from public.sampling_jobs j
    where j.batch_id = p_batch and j.status = 'pending'
    order by j.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 1), 50))
  )
  update public.sampling_jobs j
     set status = 'claimed',
         attempts = j.attempts + 1,
         worker = p_worker,
         claimed_at = now()
    from picked
   where j.id = picked.id
  returning j.id, j.prompt_id, j.model, j.replicate_idx, j.attempts;

  update public.sampling_batches
     set status = case when status = 'queued' then 'running' else status end,
         started_at = coalesce(started_at, now()),
         last_heartbeat_at = now()
   where id = p_batch;
end;
$$;

-- Jobs left 'claimed' by a worker that died are returned to the pool.
create or replace function public.requeue_stale_sampling_jobs(p_stale_minutes int default 5)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  with reset as (
    update public.sampling_jobs
       set status = 'pending', worker = null, claimed_at = null
     where status = 'claimed'
       and claimed_at < now() - make_interval(mins => greatest(1, coalesce(p_stale_minutes, 5)))
       and attempts < 3
    returning 1
  )
  select count(*) into n from reset;

  update public.sampling_jobs
     set status = 'error', error = coalesce(error, 'abandoned after 3 attempts'), finished_at = now()
   where status = 'claimed'
     and claimed_at < now() - make_interval(mins => greatest(1, coalesce(p_stale_minutes, 5)))
     and attempts >= 3;

  return n;
end;
$$;

-- Roll job outcomes up onto the batch; returns the remaining pending count.
create or replace function public.settle_sampling_batch(p_batch uuid)
returns table (pending int, completed int, failed int, total int, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending int; v_done int; v_error int; v_total int; v_status text;
begin
  select count(*) filter (where status in ('pending','claimed')),
         count(*) filter (where status = 'done'),
         count(*) filter (where status = 'error'),
         count(*)
    into v_pending, v_done, v_error, v_total
    from public.sampling_jobs where batch_id = p_batch;

  update public.sampling_batches b
     set completed_jobs = v_done,
         failed_jobs = v_error,
         total_jobs = greatest(b.total_jobs, v_total),
         last_heartbeat_at = now(),
         status = case
                    when v_pending > 0 then 'running'
                    when v_done = 0 and v_error > 0 then 'failed'
                    else 'completed'
                  end,
         finished_at = case when v_pending > 0 then null else coalesce(b.finished_at, now()) end
   where b.id = p_batch
  returning b.status into v_status;

  return query select v_pending, v_done, v_error, v_total, v_status;
end;
$$;

revoke all on function public.claim_sampling_jobs(uuid, int, text) from public, anon, authenticated;
revoke all on function public.requeue_stale_sampling_jobs(int) from public, anon, authenticated;
revoke all on function public.settle_sampling_batch(uuid) from public, anon, authenticated;
grant execute on function public.claim_sampling_jobs(uuid, int, text) to service_role;
grant execute on function public.requeue_stale_sampling_jobs(int) to service_role;
grant execute on function public.settle_sampling_batch(uuid) to service_role;