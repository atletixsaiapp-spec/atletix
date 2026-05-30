create table if not exists public.membership_reminders (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  reminder_type text not null check (
    reminder_type in ('ended_today', 'deactivation_warning')
  ),
  email text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (membership_id, reminder_type)
);

alter table public.membership_reminders enable row level security;

drop policy if exists "Admins can manage membership reminders" on public.membership_reminders;
create policy "Admins can manage membership reminders"
on public.membership_reminders
for all
using (public.is_admin())
with check (public.is_admin());
