-- Reconcile schema drift: the `rls_auto_enable` event-trigger function and its
-- `ensure_rls` trigger exist in the live database but were never defined by a
-- migration, so a rebuilt-from-repo project would lack the RLS safety net.
-- This migration captures both, and clears the advisor warnings
-- (0028/0029: public/authenticated can EXECUTE a SECURITY DEFINER function) by
-- revoking the stray EXECUTE grant.
--
-- The function is a defensive DDL guard: on every `create table` in `public`,
-- it enables row level security automatically. It RETURNS event_trigger, so
-- Postgres already blocks direct invocation ("trigger functions can only be
-- called as triggers") regardless of grants — the revoke below is advisor
-- hygiene, not a live hole. search_path stays `pg_catalog` (not empty like the
-- 0002 functions): the body calls pg_event_trigger_ddl_commands() and format(),
-- which an empty search_path would break.

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path to 'pg_catalog'
as $$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null and cmd.schema_name in ('public')
       and cmd.schema_name not in ('pg_catalog', 'information_schema')
       and cmd.schema_name not like 'pg_toast%'
       and cmd.schema_name not like 'pg_temp%' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    else
      raise log 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
    end if;
  end loop;
end;
$$;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  execute function public.rls_auto_enable();

-- Advisor remediation (0028/0029): an event-trigger function is never a valid
-- RPC target, so no legitimate caller loses anything.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
