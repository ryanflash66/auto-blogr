-- Advisor remediation for the trigger-only functions created in 0001:
-- pin a non-mutable search_path and remove RPC/EXECUTE exposure.
-- (Triggers still fire regardless of EXECUTE grants.)
alter function public.set_updated_at() set search_path = '';
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
