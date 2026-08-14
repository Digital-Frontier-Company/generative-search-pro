drop policy if exists "Allow authenticated users to read nods_page_section" on public.nods_page_section;

drop policy if exists nods_page_section_select_own on public.nods_page_section;
create policy nods_page_section_select_own on public.nods_page_section
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Enable update for users based on email" on public.profiles;