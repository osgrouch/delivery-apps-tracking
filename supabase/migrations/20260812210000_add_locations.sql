-- Add a locations table. A location is its own entity (can exist with zero
-- shifts against it, e.g. before any shift has been logged there yet), so it
-- gets a real table rather than a free-text column on shifts.
create table if not exists locations (
    id   integer generated always as identity primary key,
    name text not null unique
);

alter table locations enable row level security;

create policy "Authenticated access to locations"
    on locations for all
    to authenticated
    using (true)
    with check (true);

grant select, insert, update, delete on locations to authenticated, service_role;

-- Link shifts to a location. Nullable: existing shifts backfill to NULL
-- (there's no way to know where they happened after the fact). Shift
-- creation should start requiring a location going forward, but that's a
-- follow-up to the shift form UI, not this migration.
alter table shifts add column if not exists location_id integer references locations (id) on delete set null;

create index if not exists idx_shifts_location_id on shifts (location_id);
