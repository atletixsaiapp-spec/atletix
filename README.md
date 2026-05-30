# ATLETIX

Responsive web MVP for the ATLETIX gym app.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready client setup
- Manual payment flow for the trainer/admin

## Routes

- `/` - Account dashboard with profile, membership, routine, progress, avatar, and motivation.
- `/admin` - Trainer dashboard with analytics, manual payments, membership states, WhatsApp reminders, and account list.
- `/admin/cuentas` - Admin account list with server-side search and pagination.
- `/cuentas/[id]` - Admin account detail page.
- `/login` - Login and account access shell.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run `supabase/schema.sql` in the Supabase SQL editor.

The current UI uses seeded data from `src/lib/atletix-data.ts` so the product can be reviewed before live auth and database writes are connected.

## MVP Scope

- No payment gateway.
- Payments are confirmed outside the app, then registered manually by admin.
- No DMs or community feed yet.
- Phase 2 can add online payments, ranking, challenges, animated avatar, push notifications, and AI motivation.
