-- Add a color column to apps, backed by real per-app brand colors instead
-- of the client-side hardcoded colorForApp() lookup it replaces.
alter table apps add column if not exists color text not null default '#64748b';

update apps set color = '#286ef0' where name = 'Uber Eats';
update apps set color = '#f72e09' where name = 'DoorDash';
update apps set color = '#09af07' where name = 'InstaCart';
