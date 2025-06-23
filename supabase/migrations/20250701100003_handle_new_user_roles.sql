-- Function to handle new user and set a default role.
-- This function is called by the trigger on_auth_user_created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Check if the user has a role in their app_metadata.
  -- If not, assign them the 'client' role.
  if new.raw_app_meta_data is null or not (new.raw_app_meta_data ? 'role') then
    update auth.users
    set raw_app_meta_data = new.raw_app_meta_data || '{"role": "client"}'::jsonb
    where id = new.id;
  end if;
  return new;
end;
$$;

-- Trigger to execute the function after a new user is created.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 