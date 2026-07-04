-- Fix ambiguous client_ip reference in rate limit function (Phase 3 hotfix)
-- Run after 20260707_security_phase3.sql

create or replace function public.enforce_form_rate_limit(target_form_type text, max_per_hour integer default 5)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  request_ip text := public.request_client_ip();
  recent_count integer;
begin
  if request_ip = 'unknown' then
    return;
  end if;

  select count(*)::integer
  into recent_count
  from public.form_rate_limit_log
  where form_type = target_form_type
    and form_rate_limit_log.client_ip = request_ip
    and created_at > now() - interval '1 hour';

  if recent_count >= max_per_hour then
    raise exception 'Rate limit exceeded for % submissions. Please try again later.', target_form_type
      using errcode = 'P0001';
  end if;

  insert into public.form_rate_limit_log (form_type, client_ip)
  values (target_form_type, request_ip);
end;
$$;