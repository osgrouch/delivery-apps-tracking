# Delivery Apps Tracking (DAT)

A dashboard for tracking earnings, mileage, and trips across delivery apps
(Uber Eats, Doordash, InstaCart), with charts and a manual shift-entry form.

Stack: Next.js (App Router, TypeScript) · Supabase (Postgres + Auth) ·
Recharts · Sentry · Vercel.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Sentry](https://sentry.io) project (platform: Next.js)
- A [Vercel](https://vercel.com) account, for deployment

## 1. Supabase setup

1. Create a new Supabase project.
2. In the SQL editor, run [`schema.sql`](./schema.sql). This creates the
   `apps` and `shifts` tables, seeds the three known delivery apps, and
   enables Row Level Security so only an authenticated session can read or
   write data (the app is single-tenant — one owner account).
3. Under **Authentication > Users**, manually create your one account
   (email + password). Public sign-up isn't part of this app.
4. Under **Project Settings > API**, copy the Project URL, anon key, and
   service role key into `.env.local` (see below).

## 2. Environment variables

Copy the example file and fill in real values:

```bash
cp .env.local.example .env.local
```

| Variable | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | app, import script | Safe to expose client-side |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | app | Safe to expose client-side; RLS enforces access |
| `SUPABASE_SERVICE_ROLE_KEY` | import script only | Server-only secret, bypasses RLS — never expose to the client |
| `NEXT_PUBLIC_SENTRY_DSN` | app (client) | DSNs are safe to expose client-side |
| `SENTRY_DSN` | app (server/edge) | Optional — falls back to `NEXT_PUBLIC_SENTRY_DSN` if unset |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | build only | Used to upload source maps during `next build`; not needed to run the app locally |

## 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the
account you created in Supabase.

## 4. Import historical data (optional)

If you have existing shift data in `scripts/data/shifts.json`, seed the
database once with:

```bash
npm run import:shifts
```

The importer validates every row with Zod, maps app names to `apps.id`,
and upserts by shift id — safe to re-run.

## Testing

```bash
npm test        # run once
npm run test:watch
```

Unit tests cover the pure aggregation/formatting utilities, the Zod
validation schema, and a UI component. Server actions and Supabase queries
are thin I/O wrappers around tested logic and are intentionally not
unit-tested — verify those via the Supabase project directly (see
`/verify` or manual QA).

## Deployment

1. Push this repo to GitHub and [import it into Vercel](https://vercel.com/new).
2. Add all variables from `.env.local` to the Vercel project's Environment
   Variables (Production and Preview).
3. Deploy. `next.config.ts` is wrapped with `withSentryConfig`, so
   production builds upload source maps to Sentry automatically when
   `SENTRY_AUTH_TOKEN` is set.

## Project structure

```
schema.sql                  Supabase schema + RLS policies (source of truth)
scripts/import-shifts.ts    One-time historical data import
src/app/                    Routes: (app) dashboard/shifts (protected), login
src/components/             UI: charts, shift form/table, layout, KPI cards
src/lib/actions/            Server Actions (auth, shift CRUD)
src/lib/queries/            Server-side data fetching
src/lib/utils/aggregate.ts  Pure functions that turn shifts into chart/KPI data
src/lib/validation/         Zod schemas shared by the form and the importer
src/lib/supabase/           Browser/server Supabase clients + session middleware
src/types/database.types.ts Hand-written mirror of the Supabase schema
tests/                      Vitest + Testing Library
```
