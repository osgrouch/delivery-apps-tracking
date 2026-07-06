# Delivery Apps Tracking (DAT)

DAT is a personal income-tracking tool for gig delivery drivers. It's built
for one person to log every shift they work across delivery apps — Uber
Eats, DoorDash, and Instacart — and see exactly how much they're earning,
where, and how efficiently.

Every shift records an app, a date, a start/end time, earnings, miles
driven, and number of trips. From that raw log, DAT derives hours worked,
$/hour, $/mile, and $/trip, and rolls everything up into charts and
summaries across four views.

It's single-tenant software — there's one account (the driver logging their
own shifts), not a public multi-user product, so there's no sign-up flow.

## Dashboard

The landing page after signing in. Shows lifetime KPI totals at a glance
(total earnings, hours, miles, trips, average $/hour, average $/mile), an
"earnings over time" chart plotting weekly totals across a chosen year (with
prev/next-year navigation), and an earnings-by-app breakdown chart, each app
shown in its own color.

## Weekly View



A week-at-a-time workspace: a stacked bar chart of that week's earnings
broken down by app and day, a calendar for jumping between weeks (with the
current day and the selected week visually highlighted), and a scrollable
list of every shift logged that week — each shown as a card with its
earnings, hours, miles, and trips. A footer summarizes totals for the
selected week.

## All Time View

The all-time counterpart to Weekly View: a monthly earnings-by-app chart
you can scroll year by year, a stack of per-app lifetime stat cards (total
earnings/hours/miles/trips and blended rates), and a full table of every
shift ever logged. The table can be filtered by app and date range, sorted
by any column, and each row expands in place to preview that shift as a
card — with inline buttons to edit or delete it directly from the table.

## Add Shifts

Two ways to log a shift:

- **Manual entry** — a form for one shift at a time, with a custom
  month-by-month date picker and up/down/typeable time selectors for start
  and end time. Hours are always calculated automatically from the times,
  never entered by hand.
- **Bulk paste** — paste in a block of plain text describing several
  shifts (date, app, earnings, miles, trips, start–end time, one per line),
  and DAT parses it into a preview table before anything is saved. Parsing
  issues are called out with line numbers, and nothing hits the database
  until the parsed shifts are explicitly confirmed.

## Under the hood

Next.js (App Router) on Vercel, with Supabase (Postgres + Auth) as the
backend and Recharts for the charts. Source lives in this repo; the live
site itself requires a signed-in account to view.
