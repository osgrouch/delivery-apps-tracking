-- Correct the location on the summer 2026 shifts: everything worked between
-- May 14 and Aug 14, 2026 (both ends inclusive) happened out of
-- Williamsport, PA, not the Rochester, NY default that
-- 20260812220000_seed_locations.sql backfilled onto every pre-existing shift.
--
-- Joined on user_id because locations are per-account since
-- 20260813120000_multi_tenant_user_id.sql: each shift is pointed at its own
-- owner's "Williamsport, PA" row, and a shift whose owner has no such
-- location is left untouched rather than having its location_id nulled out.
update shifts s
set location_id = l.id
from locations l
where l.user_id = s.user_id
  and l.name = 'Williamsport, PA'
  and s.date between date '2026-05-14' and date '2026-08-14'
  and s.location_id is distinct from l.id;
