# ATLETIX Context

Use this file to quickly regain project context before making changes.

## Product

ATLETIX is a responsive web MVP for a women-focused gym.

The app is Phase 1A: polished UI and Supabase-ready foundation, with real backend wiring still in progress.

Main experiences:

- Client dashboard: profile, membership status, routine, progress, avatar, motivation.
- Admin dashboard: analytics, client list, manual payment flow, membership status, WhatsApp reminder links.
- Client detail pages for trainer review.
- Login/register shell.

No payment gateways in this phase. Payments are confirmed outside the app, then recorded manually by the trainer.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- Vercel CLI

## Important Routes

- `/` client dashboard
- `/admin` trainer/admin dashboard
- `/login` login/register shell
- `/clientes/[id]` admin client detail page

## Important Files

- `src/app/page.tsx` client dashboard
- `src/app/admin/page.tsx` admin dashboard
- `src/app/login/page.tsx` login/register shell
- `src/app/clientes/[id]/page.tsx` client detail page
- `src/lib/atletix-data.ts` seeded demo data
- `src/utils/supabase/client.ts` Supabase browser client
- `src/utils/supabase/server.ts` Supabase server client
- `src/utils/supabase/middleware.ts` session refresh helper
- `src/proxy.ts` Next.js 16 proxy hook for Supabase session refresh
- `supabase/schema.sql` initial database schema and RLS policies

## Environment

Local env lives in `.env.local` and is intentionally ignored by git.

Current app env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Local automation/env helper:

- `VERCEL_TOKEN`

Do not commit `.env.local`.

## Supabase

Project URL:

```text
https://wxbqipkajhpxqrrcvyus.supabase.co
```

The schema in `supabase/schema.sql` includes:

- profiles
- members
- memberships
- payments
- routines
- routine_assignments
- exercises
- workout_logs
- progress_entries
- motivational_messages
- achievements

Next backend step:

1. Apply `supabase/schema.sql` in Supabase SQL editor.
2. Wire auth to `/login`.
3. Replace seeded data with Supabase reads.
4. Add server actions for admin creation of clients, manual payments, membership dates, routines, and progress.

## Vercel

Do not switch global Vercel login just for this project.

Use the repo-local token from `.env.local` for Vercel CLI commands:

```bash
set -a
source .env.local
set +a
```

Then pass:

```bash
--token "$VERCEL_TOKEN"
```

Useful commands:

```bash
vercel link --yes --project <project-name-or-id> --scope <account-or-team-slug> --token "$VERCEL_TOKEN"
```

Add env vars to Vercel:

```bash
printf '%s' "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --token "$VERCEL_TOKEN"
printf '%s' "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production --token "$VERCEL_TOKEN"
```

Repeat for `preview` and `development` when needed.

If a variable already exists, remove/update it intentionally instead of blindly adding duplicates.

## GitHub

Remote:

```text
https://atletixsaiapp-spec@github.com/atletixsaiapp-spec/atletix.git
```

Initial pushed commit:

```text
b7eafda Build ATLETIX phase one MVP
```

## Checks

Run before pushing meaningful app changes:

```bash
npm run lint
npm run build
```

Known note:

- `npm run build` may need elevated permissions in this sandbox because Turbopack can bind an internal worker port.
