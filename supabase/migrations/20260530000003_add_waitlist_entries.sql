create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  date_of_birth date not null,
  preferred_group_id uuid references public.training_groups(id) on delete set null,
  notes text,
  status text not null default 'pending' check (
    status in ('pending', 'invited', 'archived')
  ),
  invited_member_id uuid references public.members(id) on delete set null,
  invited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists waitlist_entries_pending_email_key
on public.waitlist_entries (lower(email))
where status = 'pending';

create index if not exists waitlist_entries_status_created_at_idx
on public.waitlist_entries (status, created_at desc);

alter table public.waitlist_entries enable row level security;

drop policy if exists "Admins can manage waitlist entries" on public.waitlist_entries;
create policy "Admins can manage waitlist entries"
on public.waitlist_entries
for all
using (public.is_admin())
with check (public.is_admin());
