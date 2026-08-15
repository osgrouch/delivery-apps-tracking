-- Multi-tenant support: scope every row to the Supabase Auth account that
-- owns it, so a second user (e.g. a friend with their own email/password)
-- can use this app without seeing or editing the first user's apps,
-- locations, or shifts.

alter table apps      add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table locations add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table shifts    add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- Backfill existing rows to the current (sole, pre-multi-tenant) owner
-- account. No-op on a fresh database with no rows yet.
update apps      set user_id = (select id from auth.users order by created_at limit 1) where user_id is null;
update locations set user_id = (select id from auth.users order by created_at limit 1) where user_id is null;
update shifts     set user_id = (select id from auth.users order by created_at limit 1) where user_id is null;

alter table apps      alter column user_id set not null;
alter table locations alter column user_id set not null;
alter table shifts    alter column user_id set not null;

-- New rows default to the inserting user, so a normal authenticated insert
-- doesn't have to set user_id explicitly.
alter table apps      alter column user_id set default auth.uid();
alter table locations alter column user_id set default auth.uid();
alter table shifts    alter column user_id set default auth.uid();

create index if not exists idx_apps_user_id      on apps (user_id);
create index if not exists idx_locations_user_id on locations (user_id);
create index if not exists idx_shifts_user_id    on shifts (user_id);

-- Catalog names only need to be unique per-user now, not globally, so two
-- users can each have their own "DoorDash" or "Home".
alter table apps      drop constraint if exists apps_name_key;
alter table apps      add constraint apps_user_id_name_key unique (user_id, name);

alter table locations drop constraint if exists locations_name_key;
alter table locations add constraint locations_user_id_name_key unique (user_id, name);

-- Replace the single-tenant "any authenticated user" policies with
-- per-user scoping.
drop policy if exists "Authenticated access to apps" on apps;
create policy "Users manage their own apps"
    on apps for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Authenticated access to locations" on locations;
create policy "Users manage their own locations"
    on locations for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Authenticated access to shifts" on shifts;
create policy "Users manage their own shifts"
    on shifts for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
