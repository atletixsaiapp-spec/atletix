# ATLETIX Context

Use this file to quickly regain project context before making changes.

## Product

ATLETIX is a responsive web MVP for a women-focused gym.

The app is Phase 1A: polished UI and Supabase-ready foundation, with real backend wiring still in progress.

Main experiences:

- Public client login, separate simple admin login, no public signup.
- Public demo: seeded visual dashboard for reviewing the ATLETIX look and feel.
- Protected client dashboard placeholder.
- Protected admin dashboard: Supabase-backed analytics/client preview and metrics, env-backed admin login, membership status, WhatsApp reminder links.
- Protected client listing page: full client list.
- Protected client invite page: trainer-only single client invite with name, email, birth date, phone, and Resend activation email flow.
- Protected bulk client invite page: trainer can paste Excel/CSV rows, normalize contacts, create client records, and send activation emails.
- Client detail pages for trainer review and management: edit client profile, activate/revoke membership, add manual payments, view payments, progress, routine, attendance, and charts.

No payment gateways in this phase. Payments are confirmed outside the app, then recorded manually by the trainer. Only admins should create client accounts and trigger activation emails later.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- Vercel CLI

## UI Rules

- ATLETIX is mobile-first. Build and review every page, dashboard, list, form, table, and navigation state for mobile first, then scale up to tablet and desktop.
- Everything created in this app should be responsive. Do not leave new views desktop-only.
- Avoid forcing wide tables on mobile. Use mobile card/list layouts and reserve tables for tablet/desktop when needed.
- Reusable UI belongs in `src/components/ui`.
- Use `src/components/ui/atoms` for small reusable pieces, `src/components/ui/organisms` for composed sections such as navigation and admin lists, and `src/components/ui/icons` for shared icon exports.
- Before creating a page-local UI component, check whether an existing shared UI component can be reused or extended.

## Important Routes

- `/` redirects to `/login`
- `/login` public client login
- `/admin/login` public admin login
- `/demo` public seeded visual demo
- `/dashboard` protected client dashboard placeholder
- `/admin` protected trainer/admin dashboard
- `/admin/clientas` protected full client list page
- `/admin/clientas/nueva` protected single client invite page
- `/admin/clientas/importar` protected bulk client invite/import page
- `/clientes/[id]` protected admin client detail page
- `/reset-password` client password setup/reset page used by emailed Supabase recovery links

## Important Files

- `src/app/page.tsx` redirects to client login
- `src/app/login/page.tsx` public client login
- `src/app/admin/login/page.tsx` public admin login
- `src/app/demo/page.tsx` seeded visual demo
- `src/app/dashboard/page.tsx` protected client dashboard placeholder
- `src/app/admin/page.tsx` protected admin dashboard
- `src/app/admin/clientas/page.tsx` protected full client list page
- `src/app/admin/clientas/nueva/page.tsx` protected single client invite page
- `src/app/admin/clientas/importar/page.tsx` protected bulk client invite/import page
- `src/app/admin/actions.ts` admin server actions for creating client invites and bulk imports
- `src/app/auth/actions.ts` auth server actions
- `src/app/clientes/[id]/page.tsx` client detail page
- `src/app/clientes/[id]/actions.ts` client detail server actions for editing, membership control, and manual payments
- `src/app/reset-password/page.tsx` client password setup/reset page
- `src/components/auth/login-screen.tsx` client/admin login screen components
- `src/components/auth/reset-password-form.tsx` password setup/reset form
- `src/components/ui/atoms/admin-notice.tsx` shared admin notice component
- `src/components/ui/atoms/profile-metric.tsx` shared metric card component
- `src/components/ui/atoms/*` reusable small UI pieces such as brand logo, nav links, status badge
- `src/components/ui/icons/*` shared icon exports
- `src/components/ui/organisms/*` reusable larger UI pieces such as top nav, admin member table, and invite forms
- `src/lib/admin-data.ts` Supabase-backed admin dashboard loader
- `src/lib/admin-member-detail.ts` Supabase-backed client detail loader and derived metrics
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
- `RESEND_FROM_EMAIL` required for invite emails; use a verified Resend sender such as `ATLETIX <no-reply@atletix.co>`
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
3. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` locally and in Vercel for invite emails. The sender must be verified in Resend.
4. Ensure Supabase Auth URL settings allow `https://atletix.vercel.app/reset-password`.
5. Admin invite flow creates a Supabase Auth user, profile row, inactive member row, recovery link, and Resend activation email.
6. Client detail supports manual payment insertion and membership activation/revocation through server actions.
7. Gender is not yet stored in the database schema, so the detail UI currently shows it as `No registrado`.
8. Client invites store only `date_of_birth`, not age. Bulk imports can combine `EDAD` with a day/month birthday to derive the birth year; if birthday is missing, `EDAD` is only a fallback to approximate `YYYY-01-01`.
9. Invited members use default goal `Salud general` until the trainer edits the profile or the future onboarding completion screen collects it.

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
