-- Seed the known locations, and backfill every existing shift to
-- "Rochester, NY" (where all shifts logged so far were worked from).
insert into locations (name)
values ('Rochester, NY'), ('Williamsport, PA')
on conflict (name) do nothing;

update shifts
set location_id = (select id from locations where name = 'Rochester, NY');
