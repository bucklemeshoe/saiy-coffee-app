-- Allow users to insert/update their own profile row
drop policy if exists "users insert own profile" on public.users;
create policy "users insert own profile"
on public.users for insert
with check (id = auth.uid());

drop policy if exists "users update own profile" on public.users;
create policy "users update own profile"
on public.users for update
using (id = auth.uid())
with check (id = auth.uid());

