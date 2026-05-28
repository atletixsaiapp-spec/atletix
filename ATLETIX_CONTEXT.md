# ATLETIX Context

Use this file to quickly regain project context before making changes.

## Product

ATLETIX is a responsive web MVP for a fitness gym.

The app is Phase 1A: polished UI and Supabase-backed account/admin foundation.

Main experiences:

- Public account login, separate simple admin login, no public signup.
- Public demo: seeded visual dashboard for reviewing the ATLETIX look and feel.
- Protected account dashboard with real Supabase-backed profile, membership, payment, routine, attendance, progress, XP, and avatar data.
- Authenticated account/admin nav must not show public `Acceso` or `Admin` links; private nav currently exposes only `Cerrar sesión`.
- Protected onboarding flow: invited accounts complete missing profile fields before reaching dashboard.
- Onboarding is a step-by-step profile completion flow, one field per step.
- Protected admin dashboard: Supabase-backed analytics/account preview and metrics, env-backed admin login, membership status, WhatsApp reminder links.
- Protected account listing page: full member account list.
- Protected account invite page: admin-only single account invite with name, email, birth date, phone, and Resend activation email flow.
- Protected bulk account invite page: admin can paste Excel/CSV rows, normalize contacts, create account records, and send activation emails.
- Account detail pages for admin review and management: edit profile, activate/revoke membership, add manual payments, delete test/error accounts with confirmation, view payments, progress, routine, attendance, and charts.

No payment gateways in this phase. Payments are confirmed outside the app, then recorded manually by admin. Only admins should create accounts and trigger activation emails later.

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
- Public copy must stay gender-neutral. Avoid terms like `clienta`, `bienvenida`, `guerreras`, or `Strong Women Only`; prefer `cuenta`, `perfil`, `persona`, and neutral phrasing.
- User-facing copy should be Spanish. Avoid visible English product terms such as `password`, `login`, or `onboarding`; use `contraseña`, `acceso`, and `completar perfil`.
- Buttons that submit forms or trigger backend/client mutations must show a shared spinner loading state and be disabled while pending. Use `LoadingSpinner` and `PendingSubmitButton` from `src/components/ui/atoms`.

## Important Routes

- `/` redirects signed-in users to their saved area, otherwise to `/login`
- `/login` public account login; redirects existing account sessions to `/dashboard` or `/onboarding`
- `/admin/login` public admin login; redirects existing admin sessions to `/admin`
- `/demo` public seeded visual demo
- `/dashboard` protected account dashboard backed by Supabase data
- `/onboarding` protected account completion flow shown until required member fields are complete
- `/admin` protected trainer/admin dashboard
- `/admin/clientas` protected full account list page
- `/admin/clientas/nueva` protected single account invite page
- `/admin/clientas/importar` protected bulk account invite/import page
- `/clientes/[id]` protected admin account detail page
- `/auth/confirm` Supabase token confirmation route used by invite emails before redirecting to password setup
- `/reset-password` account password setup/reset page used after email invite confirmation

## Important Files

- `src/app/page.tsx` redirects to the right area based on existing session
- `src/app/login/page.tsx` public account login with existing-session redirect
- `src/app/admin/login/page.tsx` public admin login with existing-session redirect
- `src/app/demo/page.tsx` seeded visual demo
- `src/app/dashboard/page.tsx` protected account dashboard route
- `src/components/ui/organisms/member-dashboard.tsx` shared account dashboard UI
- `src/lib/member-dashboard.ts` account dashboard data loader/fallback mapper
- `src/app/onboarding/page.tsx` protected account completion page
- `src/app/onboarding/actions.ts` server action for saving onboarding fields
- `src/app/admin/page.tsx` protected admin dashboard
- `src/app/admin/clientas/page.tsx` protected full account list page
- `src/app/admin/clientas/nueva/page.tsx` protected single account invite page
- `src/app/admin/clientas/importar/page.tsx` protected bulk account invite/import page
- `src/app/admin/actions.ts` admin server actions for creating account invites and bulk imports
- `src/app/auth/actions.ts` auth server actions
- `src/app/auth/confirm/route.ts` verifies Supabase invite/recovery token hashes and sets the session cookie
- `src/app/clientes/[id]/page.tsx` account detail page
- `src/app/clientes/[id]/actions.ts` account detail server actions for editing, membership control, and manual payments
- `src/app/reset-password/page.tsx` account password setup/reset page
- `src/components/auth/login-screen.tsx` account/admin login screen components
- `src/components/auth/reset-password-form.tsx` password setup/reset form
- `src/components/ui/atoms/admin-notice.tsx` shared admin notice component
- `src/components/ui/atoms/profile-metric.tsx` shared metric card component
- `src/components/ui/organisms/confirmation-modal.tsx` shared confirmation modal for destructive admin actions
- `src/components/ui/atoms/pending-submit-button.tsx` shared pending submit button for Server Action forms
- `src/components/ui/atoms/*` reusable small UI pieces such as brand logo, nav links, status badge
- `src/components/ui/icons/*` shared icon exports
- `src/components/ui/organisms/*` reusable larger UI pieces such as top nav, admin member table, and invite forms
- `src/components/ui/organisms/top-nav.tsx` supports `mode="public" | "member" | "admin"`; use public mode only on public entry screens.
- `src/lib/admin-data.ts` Supabase-backed admin dashboard loader
- `src/lib/admin-member-detail.ts` Supabase-backed account detail loader and derived metrics
- `src/lib/admin-session.ts` env-backed admin session cookie helpers
- `src/lib/auth.ts` server-side auth/role guards
- `src/lib/email.ts` Resend email helper
- `src/lib/site.ts` site URL helper for email links
- `src/lib/atletix-data.ts` seeded demo data
- `src/utils/supabase/admin.ts` Supabase service role admin helper
- `src/utils/supabase/client.ts` Supabase browser helper
- `src/utils/supabase/server.ts` Supabase server helper
- `src/utils/supabase/middleware.ts` session refresh helper
- `src/proxy.ts` Next.js 16 proxy hook for Supabase session refresh
- `supabase/schema.sql` initial database schema and RLS policies

## Environment

Local env lives in `.env.local` and is intentionally ignored by git.

Current app env vars:

- `ATLETIX_ADMIN_USERNAME`
- `ATLETIX_ADMIN_PASSWORD`
- `ATLETIX_ADMIN_SESSION_SECRET` optional; when omitted, admin password is used to sign the session cookie
- `ATLETIX_SITE_URL` canonical public app URL for emails; production should be `https://www.atletix.co`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` required for invite emails; use a verified Resend sender such as `ATLETIX <no-reply@atletix.co>`
- `SUPABASE_SERVICE_ROLE_KEY`

Local automation/env helper:

- `VERCEL_TOKEN`

Do not commit `.env.local`.

Admin login is currently env-backed for the first phase. Account login still uses Supabase Auth. The admin dashboard needs `SUPABASE_SERVICE_ROLE_KEY` because the env-backed admin session is not a Supabase Auth session and should read/write protected tables through a server-only service role helper.

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
2. Add `SUPABASE_SERVICE_ROLE_KEY` locally and in Vercel for admin reads and account creation.
3. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` locally and in Vercel for invite emails. The sender must be verified in Resend.
4. Admin invite emails should use `ATLETIX_SITE_URL=https://www.atletix.co` so activation buttons never fall back to localhost.
5. Admin invite flow creates a Supabase Auth user, profile row, inactive member row, recovery token hash, and Resend activation email. The email button points to `/auth/confirm`, which verifies the token hash and redirects the account to `/reset-password`.
6. Password setup auto-routes to `/onboarding`; future login/dashboard access also redirects there until required member fields are complete.
7. Onboarding status is currently derived from existing member fields: name, phone, birth date, goal, height, and current weight. Gender is collected optionally and stored in Supabase Auth user metadata because the database schema does not yet include a `gender` column.
8. Onboarding asks for one weight value only: `Peso de hoy`. The server stores it as `members.current_weight_kg`, uses it as `members.initial_weight_kg` only when no baseline exists yet, and creates/updates the same-day `progress_entries.weight_kg` row so weight history starts in the progress table.
9. Account detail supports manual payment insertion, membership activation/revocation, and full test/error account deletion through server actions.
10. Account invites store only `date_of_birth`, not age. Admin invite/import UI should ask for `Fecha de nacimiento`; do not show or request `EDAD`.
11. Invited members use default goal `Salud general` until the admin edits the profile or onboarding completion collects it.

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

Production URLs:

```text
https://www.atletix.co
https://atletix.co
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

Use the local ignored `.env.local` variable `GITHUB_PUSH_TOKEN` for pushes to this repo. Do not store the token value in markdown or commit it. If normal `git push` opens askpass, push with a temporary `GIT_ASKPASS` script that reads `GITHUB_PUSH_TOKEN` from `.env.local`.

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
