-- Delivery Apps Tracking — Supabase (Postgres) schema
-- Run this in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- Delivery platforms (Uber Eats, Doordash, InstaCart, ...)
create table if not exists apps (
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

create index if not exists idx_shifts_date   on shifts (date);
create index if not exists idx_shifts_app_id on shifts (app_id);

-- Row Level Security
-- This is a single-tenant app: one authenticated owner account.
-- The Supabase anon key alone can never read or write; a valid
-- authenticated session (via Supabase Auth) is required for everything.
alter table apps   enable row level security;
alter table shifts enable row level security;

create policy "Authenticated access to apps"
    on apps for all
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated access to shifts"
    on shifts for all
    to authenticated
    using (true)
    with check (true);

-- Table-level grants. RLS policies alone are not enough: without these,
-- Postgres rejects every query with "permission denied for table ..."
-- before RLS is even evaluated. service_role bypasses RLS but is not the
-- table owner, so it still needs an explicit grant (used by
-- scripts/import-shifts.ts). anon is intentionally left ungranted — only
-- an authenticated session or the service role can touch these tables.
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on apps, shifts to authenticated, service_role;

-- Apply the same grants automatically to any tables added later.
alter default privileges in schema public
    grant select, insert, update, delete on tables to authenticated, service_role;

-- Seed the known delivery platforms
insert into apps (name)
values ('Uber Eats'), ('Doordash'), ('InstaCart')
on conflict (name) do nothing;
