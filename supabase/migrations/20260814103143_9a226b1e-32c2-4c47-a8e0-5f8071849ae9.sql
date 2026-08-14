create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Tenancy
-- ---------------------------------------------------------------------------
create table if not exists public.accounts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.account_members (
  account_id   uuid not null references public.accounts(id) on delete cascade,
  user_id      uuid not null,
  role         text not null default 'member' check (role in ('owner','member','viewer')),
  created_at   timestamptz not null default now(),
  primary key (account_id, user_id)
);

create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references public.accounts(id) on delete cascade,
  name         text not null,
  description  text,
  created_at   timestamptz not null default now(),
  unique (account_id, name)
);

create table if not exists public.brands (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.accounts(id) on delete cascade,
  category_id   uuid references public.categories(id) on delete set null,
  name          text not null,
  domain        text,
  is_client     boolean not null default false,
  aliases       text[] not null default '{}',
  created_at    timestamptz not null default now(),
  unique (account_id, name)
);
create index if not exists brands_category_idx on public.brands(category_id);
create index if not exists brands_name_trgm_idx on public.brands using gin (name gin_trgm_ops);

create table if not exists public.prompt_panels (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.accounts(id) on delete cascade,
  brand_id      uuid not null references public.brands(id) on delete cascade,
  version       integer not null default 1,
  status        text not null default 'draft' check (status in ('draft','active','retired')),
  rationale     text,
  generated_at  timestamptz not null default now(),
  unique (brand_id, version)
);

create table if not exists public.prompts (
  id            uuid primary key default gen_random_uuid(),
  panel_id      uuid not null references public.prompt_panels(id) on delete cascade,
  text          text not null,
  intent_stage  text not null check (intent_stage in
                  ('problem_unaware','solution_seeking','comparison','branded','post_purchase')),
  prompt_class  text not null check (prompt_class in
                  ('unbranded','category','comparison','branded','long_tail')),
  tags          text[] not null default '{}',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists prompts_panel_idx on public.prompts(panel_id) where is_active;
create index if not exists prompts_class_idx on public.prompts(prompt_class);

create table if not exists public.runs (
  id             uuid primary key default gen_random_uuid(),
  prompt_id      uuid not null references public.prompts(id) on delete cascade,
  model          text not null,
  provider       text not null,
  run_at         timestamptz not null default now(),
  run_date       date generated always as ((run_at at time zone 'UTC')::date) stored,
  replicate_idx  integer not null default 0,
  raw_response   text,
  response_json  jsonb,
  prompt_tokens  integer,
  output_tokens  integer,
  cost_usd       numeric(10,6),
  latency_ms     integer,
  status         text not null default 'ok' check (status in ('ok','error','filtered','timeout')),
  error_message  text
);
create index if not exists runs_prompt_date_idx on public.runs(prompt_id, run_date);
create index if not exists runs_model_date_idx on public.runs(model, run_date);
create index if not exists runs_date_idx on public.runs(run_date);
create unique index if not exists runs_dedupe_idx
  on public.runs(prompt_id, model, run_date, replicate_idx);

create table if not exists public.mentions (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references public.runs(id) on delete cascade,
  brand_id    uuid not null references public.brands(id) on delete cascade,
  position    integer,
  sentiment   text check (sentiment in ('positive','neutral','negative','mixed')),
  verbatim    text,
  is_endorsed boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (run_id, brand_id)
);
create index if not exists mentions_brand_idx on public.mentions(brand_id);
create index if not exists mentions_run_idx on public.mentions(run_id);

create table if not exists public.sources (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references public.accounts(id) on delete cascade,
  category_id     uuid references public.categories(id) on delete set null,
  domain          text not null,
  source_type     text check (source_type in
                    ('review_platform','community','listicle','news','vendor_site',
                     'documentation','directory','academic','social','video','other')),
  accessibility   text check (accessibility in ('open','earned','paid','closed','owned')),
  notes           text,
  created_at      timestamptz not null default now(),
  unique (account_id, domain)
);
create index if not exists sources_category_idx on public.sources(category_id);

create table if not exists public.citations (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid not null references public.runs(id) on delete cascade,
  source_id       uuid references public.sources(id) on delete set null,
  url             text not null,
  domain          text not null,
  rank            integer,
  anchor_context  text,
  created_at      timestamptz not null default now()
);
create index if not exists citations_run_idx on public.citations(run_id);
create index if not exists citations_domain_idx on public.citations(domain);
create index if not exists citations_source_idx on public.citations(source_id);

create table if not exists public.interventions (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.accounts(id) on delete cascade,
  brand_id      uuid not null references public.brands(id) on delete cascade,
  source_id     uuid references public.sources(id) on delete set null,
  type          text not null check (type in
                  ('schema','content','off_site_mention','review','directory',
                   'wikidata','pr','technical','other')),
  description   text not null,
  target_url    text,
  shipped_at    timestamptz not null,
  expected_lag_days integer not null default 14,
  created_at    timestamptz not null default now()
);
create index if not exists interventions_brand_idx on public.interventions(brand_id, shipped_at);

create table if not exists public.scores_daily (
  brand_id      uuid not null references public.brands(id) on delete cascade,
  panel_id      uuid not null references public.prompt_panels(id) on delete cascade,
  model         text not null,
  prompt_class  text not null,
  date          date not null,
  n_runs        integer not null,
  n_mentions    integer not null,
  answer_share  numeric(6,5) not null,
  ci_low        numeric(6,5) not null,
  ci_high       numeric(6,5) not null,
  is_reliable   boolean not null default false,
  computed_at   timestamptz not null default now(),
  primary key (brand_id, panel_id, model, prompt_class, date)
);
create index if not exists scores_daily_brand_date_idx on public.scores_daily(brand_id, date);

create table if not exists public.methodology_config (
  key         text primary key,
  value       numeric not null,
  rationale   text
);
insert into public.methodology_config (key, value, rationale) values
  ('min_runs_brand',      7,    'SE<0.10 for per-brand mention detection'),
  ('min_runs_source',     8,    'SE<0.10 for source-level citation coverage'),
  ('min_window_days',    14,    'Minimum days for a directional read'),
  ('compare_window_days',24,    'Days needed for SE<0.05 when comparing brands'),
  ('z_score',           1.96,   '95% confidence interval')
on conflict (key) do nothing;

create table if not exists public.harness_alerts (
  id          uuid primary key default gen_random_uuid(),
  panel_id    uuid references public.prompt_panels(id) on delete cascade,
  severity    text not null check (severity in ('info','warn','critical')),
  message     text not null,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on
  public.accounts, public.account_members, public.categories, public.brands,
  public.prompt_panels, public.prompts, public.runs, public.mentions,
  public.sources, public.citations, public.interventions, public.scores_daily,
  public.harness_alerts
to authenticated;
grant select on public.methodology_config to authenticated;
grant all on
  public.accounts, public.account_members, public.categories, public.brands,
  public.prompt_panels, public.prompts, public.runs, public.mentions,
  public.sources, public.citations, public.interventions, public.scores_daily,
  public.harness_alerts, public.methodology_config
to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.accounts          enable row level security;
alter table public.account_members   enable row level security;
alter table public.categories        enable row level security;
alter table public.brands            enable row level security;
alter table public.prompt_panels     enable row level security;
alter table public.prompts           enable row level security;
alter table public.runs              enable row level security;
alter table public.mentions          enable row level security;
alter table public.sources           enable row level security;
alter table public.citations         enable row level security;
alter table public.interventions     enable row level security;
alter table public.scores_daily      enable row level security;
alter table public.methodology_config enable row level security;
alter table public.harness_alerts    enable row level security;

create or replace function public.current_account_ids()
returns setof uuid
language sql stable security definer
set search_path = public
as $$
  select account_id from public.account_members where user_id = auth.uid();
$$;
revoke all on function public.current_account_ids() from public, anon;
grant execute on function public.current_account_ids() to authenticated, service_role;

do $$
declare t text;
begin
  foreach t in array array['categories','brands','prompt_panels','sources','interventions']
  loop
    execute format($f$
      drop policy if exists %1$s_account_isolation on public.%1$s;
      create policy %1$s_account_isolation on public.%1$s
        to authenticated
        using (account_id in (select public.current_account_ids()))
        with check (account_id in (select public.current_account_ids()));
    $f$, t);
  end loop;
end $$;

drop policy if exists accounts_member_read on public.accounts;
create policy accounts_member_read on public.accounts
  for select to authenticated
  using (id in (select public.current_account_ids()));

drop policy if exists account_members_self on public.account_members;
create policy account_members_self on public.account_members
  for select to authenticated
  using (user_id = auth.uid() or account_id in (select public.current_account_ids()));

drop policy if exists prompts_account_isolation on public.prompts;
create policy prompts_account_isolation on public.prompts
  to authenticated
  using (exists (
    select 1 from public.prompt_panels p
    where p.id = prompts.panel_id
      and p.account_id in (select public.current_account_ids())
  ))
  with check (exists (
    select 1 from public.prompt_panels p
    where p.id = prompts.panel_id
      and p.account_id in (select public.current_account_ids())
  ));

drop policy if exists runs_account_isolation on public.runs;
create policy runs_account_isolation on public.runs
  for select to authenticated
  using (exists (
    select 1 from public.prompts pr
    join public.prompt_panels p on p.id = pr.panel_id
    where pr.id = runs.prompt_id
      and p.account_id in (select public.current_account_ids())
  ));

drop policy if exists mentions_account_isolation on public.mentions;
create policy mentions_account_isolation on public.mentions
  for select to authenticated
  using (exists (
    select 1 from public.brands b
    where b.id = mentions.brand_id
      and b.account_id in (select public.current_account_ids())
  ));

drop policy if exists citations_account_isolation on public.citations;
create policy citations_account_isolation on public.citations
  for select to authenticated
  using (exists (
    select 1 from public.runs r
    join public.prompts pr on pr.id = r.prompt_id
    join public.prompt_panels p on p.id = pr.panel_id
    where r.id = citations.run_id
      and p.account_id in (select public.current_account_ids())
  ));

drop policy if exists scores_daily_account_isolation on public.scores_daily;
create policy scores_daily_account_isolation on public.scores_daily
  for select to authenticated
  using (exists (
    select 1 from public.brands b
    where b.id = scores_daily.brand_id
      and b.account_id in (select public.current_account_ids())
  ));

drop policy if exists harness_alerts_account_isolation on public.harness_alerts;
create policy harness_alerts_account_isolation on public.harness_alerts
  for select to authenticated
  using (exists (
    select 1 from public.prompt_panels p
    where p.id = harness_alerts.panel_id
      and p.account_id in (select public.current_account_ids())
  ));

drop policy if exists methodology_config_read on public.methodology_config;
create policy methodology_config_read on public.methodology_config
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Scoring
-- ---------------------------------------------------------------------------
create or replace function public.methodology_value(p_key text)
returns numeric
language sql stable
set search_path = public
as $$ select value from public.methodology_config where key = p_key $$;

create or replace function public.wilson_interval(
  successes integer,
  trials    integer,
  z         numeric default 1.96
)
returns table (point numeric, ci_low numeric, ci_high numeric)
language plpgsql immutable
set search_path = public
as $$
declare
  p numeric; denom numeric; centre numeric; margin numeric;
begin
  if trials is null or trials <= 0 then
    return query select 0::numeric, 0::numeric, 1::numeric;
    return;
  end if;
  p      := successes::numeric / trials::numeric;
  denom  := 1 + (z * z) / trials;
  centre := (p + (z * z) / (2 * trials)) / denom;
  margin := (z / denom) * sqrt( (p * (1 - p) / trials) + (z * z) / (4 * trials * trials) );
  return query select round(p, 5), round(greatest(0, centre - margin), 5), round(least(1, centre + margin), 5);
end $$;

create or replace view public.v_answer_share_daily as
with base as (
  select
    b.id                     as brand_id,
    pp.id                    as panel_id,
    r.model,
    p.prompt_class,
    r.run_date               as date,
    count(distinct r.id)     as n_runs,
    count(distinct m.run_id) as n_mentions
  from public.runs r
  join public.prompts p        on p.id = r.prompt_id
  join public.prompt_panels pp on pp.id = p.panel_id
  join public.brands b         on b.account_id = pp.account_id
  left join public.mentions m  on m.run_id = r.id and m.brand_id = b.id
  where r.status = 'ok'
  group by b.id, pp.id, r.model, p.prompt_class, r.run_date
)
select
  base.*,
  w.point  as answer_share,
  w.ci_low,
  w.ci_high,
  (base.n_runs >= public.methodology_value('min_runs_brand')) as is_reliable
from base
cross join lateral public.wilson_interval(
  base.n_mentions::integer, base.n_runs::integer, public.methodology_value('z_score')
) w;

alter view public.v_answer_share_daily set (security_invoker = on);
grant select on public.v_answer_share_daily to authenticated, service_role;

create or replace function public.answer_share_window(
  p_brand_id   uuid,
  p_end_date   date default current_date,
  p_window_days integer default 14,
  p_model      text default null,
  p_prompt_class text default null
)
returns table (
  brand_id uuid, model text, prompt_class text, window_start date, window_end date,
  n_runs bigint, n_mentions bigint, answer_share numeric, ci_low numeric, ci_high numeric,
  is_reliable boolean, reliability_note text
)
language plpgsql stable
set search_path = public
as $$
declare
  v_start date := p_end_date - (p_window_days - 1);
  v_min_days integer := public.methodology_value('min_window_days')::integer;
begin
  return query
  with base as (
    select
      b.id as bid,
      coalesce(p_model, r.model) as mdl,
      coalesce(p_prompt_class, p.prompt_class) as cls,
      count(distinct r.id)     as runs,
      count(distinct m.run_id) as hits,
      count(distinct r.run_date) as days_covered,
      (count(distinct r.id)::numeric
        / nullif(count(distinct p.id) * count(distinct r.run_date), 0)) as runs_per_prompt_day
    from public.runs r
    join public.prompts p        on p.id = r.prompt_id
    join public.prompt_panels pp on pp.id = p.panel_id
    join public.brands b         on b.id = p_brand_id and b.account_id = pp.account_id
    left join public.mentions m  on m.run_id = r.id and m.brand_id = b.id
    where r.status = 'ok'
      and r.run_date between v_start and p_end_date
      and (p_model is null or r.model = p_model)
      and (p_prompt_class is null or p.prompt_class = p_prompt_class)
    group by b.id, coalesce(p_model, r.model), coalesce(p_prompt_class, p.prompt_class)
  )
  select
    base.bid, base.mdl, base.cls, v_start, p_end_date, base.runs, base.hits,
    w.point, w.ci_low, w.ci_high,
    (base.runs_per_prompt_day >= public.methodology_value('min_runs_brand')
      and base.days_covered >= v_min_days),
    case
      when base.runs_per_prompt_day < public.methodology_value('min_runs_brand')
        then format('UNRELIABLE: %.1f runs/prompt/day, floor is %s. Report as directional only.',
                    base.runs_per_prompt_day, public.methodology_value('min_runs_brand'))
      when base.days_covered < v_min_days
        then format('UNRELIABLE: %s days of data, floor is %s.', base.days_covered, v_min_days)
      else 'OK: meets sampling floor.'
    end
  from base
  cross join lateral public.wilson_interval(
    base.hits::integer, base.runs::integer, public.methodology_value('z_score')
  ) w;
end $$;

create or replace function public.source_graph(
  p_panel_id    uuid,
  p_end_date    date default current_date,
  p_window_days integer default 28,
  p_client_domain text default null
)
returns table (
  domain text, source_id uuid, source_type text, accessibility text,
  citation_count bigint, distinct_prompts bigint, distinct_runs bigint,
  share_of_citations numeric, cumulative_share numeric, client_present boolean,
  leverage_rank bigint
)
language sql stable
set search_path = public
as $$
  with cites as (
    select c.domain, c.id as cite_id, r.id as run_id, p.id as prompt_id, c.source_id
    from public.citations c
    join public.runs r    on r.id = c.run_id
    join public.prompts p on p.id = r.prompt_id
    where p.panel_id = p_panel_id
      and r.status = 'ok'
      and r.run_date between (p_end_date - (p_window_days - 1)) and p_end_date
  ),
  agg as (
    select cites.domain,
      max(cites.source_id::text)::uuid as source_id,
      count(*) as citation_count,
      count(distinct cites.prompt_id) as distinct_prompts,
      count(distinct cites.run_id) as distinct_runs
    from cites group by cites.domain
  ),
  total as (select nullif(sum(citation_count), 0) as t from agg),
  ranked as (
    select agg.*,
      round(agg.citation_count::numeric / (select t from total), 5) as share_of_citations,
      row_number() over (order by agg.citation_count desc, agg.distinct_prompts desc) as leverage_rank
    from agg
  )
  select
    ranked.domain, ranked.source_id, s.source_type, s.accessibility,
    ranked.citation_count, ranked.distinct_prompts, ranked.distinct_runs,
    ranked.share_of_citations,
    round(sum(ranked.share_of_citations) over (
      order by ranked.leverage_rank rows between unbounded preceding and current row), 5),
    (p_client_domain is not null and ranked.domain ilike '%' || p_client_domain || '%'),
    ranked.leverage_rank
  from ranked
  left join public.sources s on s.id = ranked.source_id
  order by ranked.leverage_rank;
$$;

create or replace function public.citation_stability(
  p_panel_id    uuid,
  p_end_date    date default current_date,
  p_window_days integer default 14
)
returns table (
  date_a date, date_b date, overlap_count bigint, union_count bigint,
  jaccard numeric, within_expected_band boolean
)
language sql stable
set search_path = public
as $$
  with daily as (
    select r.run_date as d, array_agg(distinct c.domain) as domains
    from public.citations c
    join public.runs r    on r.id = c.run_id
    join public.prompts p on p.id = r.prompt_id
    where p.panel_id = p_panel_id
      and r.status = 'ok'
      and r.run_date between (p_end_date - (p_window_days - 1)) and p_end_date
    group by r.run_date
  ),
  pairs as (
    select a.d as date_a, b.d as date_b, a.domains as da, b.domains as db
    from daily a join daily b on b.d = a.d + 1
  )
  select
    pairs.date_a, pairs.date_b,
    cardinality(array(select unnest(pairs.da) intersect select unnest(pairs.db)))::bigint,
    cardinality(array(select unnest(pairs.da) union  select unnest(pairs.db)))::bigint,
    round(
      cardinality(array(select unnest(pairs.da) intersect select unnest(pairs.db)))::numeric
      / nullif(cardinality(array(select unnest(pairs.da) union select unnest(pairs.db))), 0), 4),
    (
      cardinality(array(select unnest(pairs.da) intersect select unnest(pairs.db)))::numeric
      / nullif(cardinality(array(select unnest(pairs.da) union select unnest(pairs.db))), 0)
    ) between 0.20 and 0.65
  from pairs
  order by pairs.date_a;
$$;

create or replace function public.refresh_scores_daily(p_date date default current_date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_rows integer;
begin
  insert into public.scores_daily (
    brand_id, panel_id, model, prompt_class, date,
    n_runs, n_mentions, answer_share, ci_low, ci_high, is_reliable, computed_at
  )
  select v.brand_id, v.panel_id, v.model, v.prompt_class, v.date,
    v.n_runs, v.n_mentions, v.answer_share, v.ci_low, v.ci_high, v.is_reliable, now()
  from public.v_answer_share_daily v
  where v.date = p_date
  on conflict (brand_id, panel_id, model, prompt_class, date)
  do update set
    n_runs = excluded.n_runs, n_mentions = excluded.n_mentions,
    answer_share = excluded.answer_share, ci_low = excluded.ci_low,
    ci_high = excluded.ci_high, is_reliable = excluded.is_reliable, computed_at = now();
  get diagnostics v_rows = row_count;
  return v_rows;
end $$;

create or replace function public.check_harness_health()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_panel record; v_mean numeric; v_alerts integer := 0;
begin
  for v_panel in select id from public.prompt_panels where status = 'active' loop
    select avg(jaccard) into v_mean from public.citation_stability(v_panel.id, current_date, 14);
    if v_mean is null then
      continue;
    elsif v_mean > 0.75 then
      insert into public.harness_alerts (panel_id, severity, message)
      values (v_panel.id, 'critical', format(
        'Citation overlap %.2f is far above the expected 0.34-0.42 band. Suspect response caching, a pinned seed, or a provider returning stale results.', v_mean));
      v_alerts := v_alerts + 1;
    elsif v_mean < 0.15 then
      insert into public.harness_alerts (panel_id, severity, message)
      values (v_panel.id, 'warn', format(
        'Citation overlap %.2f is below the expected band. Either the category is unusually volatile or prompts are too broad.', v_mean));
      v_alerts := v_alerts + 1;
    end if;
  end loop;
  return v_alerts;
end $$;

revoke all on function public.methodology_value(text) from public, anon;
revoke all on function public.wilson_interval(integer,integer,numeric) from public, anon;
revoke all on function public.answer_share_window(uuid,date,integer,text,text) from public, anon;
revoke all on function public.source_graph(uuid,date,integer,text) from public, anon;
revoke all on function public.citation_stability(uuid,date,integer) from public, anon;
revoke all on function public.refresh_scores_daily(date) from public, anon;
revoke all on function public.check_harness_health() from public, anon;
grant execute on function public.methodology_value(text) to authenticated, service_role;
grant execute on function public.wilson_interval(integer,integer,numeric) to authenticated, service_role;
grant execute on function public.answer_share_window(uuid,date,integer,text,text) to authenticated, service_role;
grant execute on function public.source_graph(uuid,date,integer,text) to authenticated, service_role;
grant execute on function public.citation_stability(uuid,date,integer) to authenticated, service_role;
grant execute on function public.refresh_scores_daily(date) to service_role;
grant execute on function public.check_harness_health() to service_role;

-- ---------------------------------------------------------------------------
-- Scheduling (SQL-only jobs; panel sampling is invoked from the app/edge fn)
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('frontier-aeo-nightly-rollup');
exception when others then null;
end $$;
select cron.schedule('frontier-aeo-nightly-rollup', '0 3 * * *',
  $$ select public.refresh_scores_daily(current_date); $$);

do $$
begin
  perform cron.unschedule('frontier-aeo-harness-health');
exception when others then null;
end $$;
select cron.schedule('frontier-aeo-harness-health', '0 6 * * 1',
  $$ select public.check_harness_health(); $$);