create extension if not exists pg_cron with schema extensions;

select cron.unschedule('requeue-stale-sampling-jobs')
where exists (select 1 from cron.job where jobname = 'requeue-stale-sampling-jobs');

select cron.schedule(
  'requeue-stale-sampling-jobs',
  '* * * * *',
  $$select public.requeue_stale_sampling_jobs(5);$$
);