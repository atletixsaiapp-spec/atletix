# ATLETIX Context

Use this file to quickly regain project context before making changes.

## Product

ATLETIX is a responsive web MVP for a women-focused gym.

The app is Phase 1A: polished UI and Supabase-ready foundation, with real backend wiring still in progress.

Main experiences:

- Public client login, separate simple admin login, no public signup.
- Public demo: seeded visual dashboard for reviewing the ATLETIX look and feel.
- Protected client dashboard placeholder.
- Protected admin dashboard: Supabase-backed analytics/client list, env-backed admin login, client creation, Resend welcome/reset email flow, manual payment placeholder, membership status, WhatsApp reminder links.
- Client detail pages for trainer review.

No payment gateways in this phase. Payments are confirmed outside the app, then recorded manually by the trainer. Only admins should create client accounts and trigger activation emails later.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- Vercel CLI

## Important Routes

- `/` redirects to `/login`
- `/login` public client login
- `/admin/login` public admin login
- `/demo` public seeded visual demo
- `/dashboard` protected client dashboard placeholder
- `/admin` protected trainer/admin dashboard
- `/clientes/[id]` protected admin client detail page
- `/reset-password` client password setup/reset page used by emailed Supabase recovery links

## Important Files

- `src/app/page.tsx` redirects to client login
- `src/app/login/page.tsx` public client login
- `src/app/admin/login/page.tsx` public admin login
- `src/app/demo/page.tsx` seeded visual demo
- `src/app/dashboard/page.tsx` protected client dashboard placeholder
- `src/app/admin/page.tsx` protected admin dashboard
- `src/app/admin/actions.ts` admin server actions for creating client accounts
- `src/app/auth/actions.ts` auth server actions
- `src/app/clientes/[id]/page.tsx` client detail page
- `src/app/reset-password/page.tsx` client password setup/reset page
- `src/components/auth/login-screen.tsx` client/admin login screen components
- `src/components/auth/reset-password-form.tsx` password setup/reset form
- `src/lib/admin-data.ts` Supabase-backed admin dashboard loader
- `src/lib/admin-session.ts` env-backed admin session cookie helpers
- `src/lib/auth.ts` server-side auth/role guards
- `src/lib/email.ts` Resend email helper
- `src/lib/site.ts` site URL helper for email links
- `src/lib/atletix-data.ts` seeded demo data
- `src/utils/supabase/admin.ts` Supabase service role admin client
- `src/utils/supabase/client.ts` Supabase browser client
- `src/utils/supabase/server.ts` Supabase server client
- `src/utils/supabase/middleware.ts` session refresh helper
- `src/proxy.ts` Next.js 16 proxy hook for Supabase session refresh
- `supabase/schema.sql` initial database schema and RLS policies

## Environment

Local env lives in `.env.local` and is intentionally ignored by git.

Current app env vars:

- `ATLETIX_ADMIN_USERNAME`
- `ATLETIX_ADMIN_PASSWORD`
- `ATLETIX_ADMIN_SESSION_SECRET` optional; when omitted, admin password is used to sign the session cookie
- `ATLETIX_SITE_URL` optional; defaults to production Vercel URL
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` optional; defaults to `ATLETIX <onboarding@resend.dev>`
- `SUPABASE_SERVICE_ROLE_KEY`

Local automation/env helper:

- `VERCEL_TOKEN`

Do not commit `.env.local`.

Admin login is currently env-backed for the first phase. Client login still uses Supabase Auth. The admin dashboard needs `SUPABASE_SERVICE_ROLE_KEY` because the env-backed admin session is not a Supabase Auth session and should read/write protected tables through a server-only service role client.

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

Current backend notes:

1. Apply `supabase/schema.sql` in Supabase SQL editor.
2. Add `SUPABASE_SERVICE_ROLE_KEY` locally and in Vercel for admin reads and client creation.
3. Add `RESEND_API_KEY` locally and in Vercel for welcome/reset emails.
4. Ensure Supabase Auth URL settings allow `https://atletix.vercel.app/reset-password`.
5. Admin creation flow creates a Supabase Auth user, profile row, member row, recovery link, and Resend email.
6. Manual payments, membership date creation, routines, and progress write actions still need to be connected.

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

Current linked Vercel project:

```text
shaquille-s-projects1/atletix
```

Production URL:

```text
https://atletix.vercel.app
```

Project settings fixed previously:

- Framework preset set to Next.js.
- Vercel deployment authentication disabled for public access.

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
