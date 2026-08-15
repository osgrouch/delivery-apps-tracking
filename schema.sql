-- Delivery Apps Tracking — Supabase (Postgres) schema
-- Run this in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- Delivery platforms (Uber Eats, DoorDash, InstaCart, ...)
create table if not exists apps (
    id    integer generated always as identity primary key,
    name  text not null unique,
    color text not null default '#64748b'
);

-- Backfill for a database created before `color` existed.
alter table apps add column if not exists color text not null default '#64748b';

-- Locations a shift can happen at. A location is its own entity (can exist
-- with zero shifts against it), so it's a real table rather than a
-- free-text column on shifts.
create table if not exists locations (
    id   integer generated always as identity primary key,
    name text not null unique
);

-- Individual delivery shifts
create table if not exists shifts (
    id         uuid primary key default gen_random_uuid(),
    app_id     integer not null references apps (id) on delete restrict,
    date       date not null,
    start_time time not null,
    end_time   time not null,
    earnings   numeric(10, 2) not null check (earnings >= 0),
    mileage    numeric(10, 2) not null check (mileage >= 0),
    trips      integer not null check (trips >= 0),
    hours      numeric(10, 2) not null check (hours > 0),
    created_at timestamptz not null default now()
);

-- Backfill for a database created before `location_id` existed. Nullable:
-- existing shifts stay NULL (no way to know where they happened after the
-- fact). Shift creation should start requiring a location going forward,
-- but that's a follow-up to the shift form UI, not this migration.
alter table shifts add column if not exists location_id integer references locations (id) on delete set null;

create index if not exists idx_shifts_date        on shifts (date);
create index if not exists idx_shifts_app_id      on shifts (app_id);
create index if not exists idx_shifts_location_id on shifts (location_id);

-- Multi-tenant: every row belongs to exactly one Supabase Auth account, so
-- more than one person can use this app without seeing each other's data.
-- Backfill for a database created before `user_id` existed: existing rows
-- are assigned to the earliest-created auth user (the original single
-- owner). No-op on a fresh database with no rows yet.
alter table apps      add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table locations add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table shifts    add column if not exists user_id uuid references auth.users (id) on delete cascade;

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

-- Row Level Security
-- Each row is only visible to and writable by the account that owns it.
-- The Supabase anon key alone can never read or write; a valid
-- authenticated session (via Supabase Auth) is required for everything.
alter table apps      enable row level security;
alter table locations enable row level security;
alter table shifts    enable row level security;

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

-- Table-level grants. RLS policies alone are not enough: without these,
-- Postgres rejects every query with "permission denied for table ..."
-- before RLS is even evaluated. service_role bypasses RLS but is not the
-- table owner, so it still needs an explicit grant (used by
-- scripts/import-shifts.ts). anon is intentionally left ungranted — only
-- an authenticated session or the service role can touch these tables.
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on apps, locations, shifts to authenticated, service_role;

-- Apply the same grants automatically to any tables added later.
alter default privileges in schema public
    grant select, insert, update, delete on tables to authenticated, service_role;

-- No seed data below this point: apps and locations are per-user now
-- (see the `user_id` columns above), so there's no single "known" catalog
-- to insert on a fresh database. Each user adds their own apps/locations
-- from the app's "Manage" UI (ManageCatalogPanel, on /add) after signing in.
