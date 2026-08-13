-- Run this once in Supabase Dashboard > SQL Editor.
-- This function can delete only a post owned by the signed-in user.
create or replace function public.delete_own_post(p_post_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.posts
  where id = p_post_id and user_id = auth.uid();

  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

revoke all on function public.delete_own_post(bigint) from public;
grant execute on function public.delete_own_post(bigint) to authenticated;

-- Make the new function immediately visible to the Supabase API.
notify pgrst, 'reload schema';
