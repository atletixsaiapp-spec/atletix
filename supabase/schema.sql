create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'member');
create type public.membership_status as enum ('active', 'expiring', 'expired');
create type public.payment_method as enum ('cash', 'transfer', 'nequi', 'daviplata', 'other');
create type public.payment_source as enum ('whatsapp', 'front_desk', 'manual');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'member',
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  lessons_per_month integer not null check (lessons_per_month > 0),
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.membership_plans (
  code,
  name,
  lessons_per_month,
  description,
  sort_order
)
values
  (
    '12-lessons-month',
    '12 clases al mes',
    12,
    'Plan mensual con 12 clases disponibles.',
    10
  ),
  (
    '20-lessons-month',
    '20 clases al mes',
    20,
    'Plan mensual con 20 clases disponibles.',
    20
  )
on conflict (code) do update
set
  name = excluded.name,
  lessons_per_month = excluded.lessons_per_month,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

create table public.training_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_time time not null unique,
  capacity integer not null check (capacity > 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.training_groups (
  name,
  start_time,
  capacity,
  sort_order
)
values
  ('7:00 a.m.', '07:00', 10, 10),
  ('1:00 p.m.', '13:00', 10, 20),
  ('4:00 p.m.', '16:00', 10, 30),
  ('5:00 p.m.', '17:00', 10, 40),
  ('6:00 p.m.', '18:00', 11, 50),
  ('7:00 p.m.', '19:00', 10, 60)
on conflict (start_time) do update
set
  name = excluded.name,
  capacity = excluded.capacity,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  membership_plan_id uuid references public.membership_plans(id) on delete set null,
  group_id uuid references public.training_groups(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  height_cm numeric(5, 2),
  initial_weight_kg numeric(5, 2),
  current_weight_kg numeric(5, 2),
  goal text not null,
  joined_at date not null default current_date,
  level text not null default 'Rookie',
  xp integer not null default 0,
  streak_days integer not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  membership_plan_id uuid references public.membership_plans(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status public.membership_status not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.membership_reminders (
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

create table public.waitlist_entries (
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

create unique index waitlist_entries_pending_email_key
on public.waitlist_entries (lower(email))
where status = 'pending';

create index waitlist_entries_status_created_at_idx
on public.waitlist_entries (status, created_at desc);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  amount_cop integer check (amount_cop is null or amount_cop > 0),
  paid_at date not null default current_date,
  period_start date,
  period_end date,
  method public.payment_method not null default 'transfer',
  source public.payment_source not null default 'whatsapp',
  status text not null default 'approved' check (
    status in ('pending', 'approved', 'rejected')
  ),
  screenshot_url text,
  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  confirmed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index payments_status_paid_at_idx
on public.payments (status, paid_at desc);

create index payments_member_paid_at_idx
on public.payments (member_id, paid_at desc);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  day_name text not null,
  coach_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routine_assignments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  routine_id uuid not null references public.routines(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  is_current boolean not null default true
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  name text not null,
  sets text not null,
  reps text not null,
  load text,
  media_url text,
  coach_note text,
  sort_order integer not null default 0
);

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  group_id uuid references public.training_groups(id) on delete set null,
  routine_id uuid references public.routines(id) on delete set null,
  completed_at timestamptz not null default now(),
  xp_awarded integer not null default 50,
  notes text
);

create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  entry_date date not null default current_date,
  weight_kg numeric(5, 2),
  waist_cm numeric(5, 2),
  hip_cm numeric(5, 2),
  leg_cm numeric(5, 2),
  arm_cm numeric(5, 2),
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.motivational_messages (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  title text not null,
  xp_awarded integer not null default 0,
  unlocked_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.membership_plans enable row level security;
alter table public.training_groups enable row level security;
alter table public.members enable row level security;
alter table public.memberships enable row level security;
alter table public.membership_reminders enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.payments enable row level security;
alter table public.routines enable row level security;
alter table public.routine_assignments enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_logs enable row level security;
alter table public.progress_entries enable row level security;
alter table public.motivational_messages enable row level security;
alter table public.achievements enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create policy "Admins can manage profiles"
on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read their own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "Admins can manage membership plans"
on public.membership_plans
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Signed in users can read active membership plans"
on public.membership_plans
for select
using (auth.uid() is not null and is_active = true);

create policy "Admins can manage training groups"
on public.training_groups
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Signed in users can read active training groups"
on public.training_groups
for select
using (auth.uid() is not null and is_active = true);

create policy "Admins can manage members"
on public.members
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read themselves"
on public.members
for select
using (user_id = auth.uid());

create policy "Admins can manage member records"
on public.memberships
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read their membership"
on public.memberships
for select
using (
  exists (
    select 1
    from public.members
    where members.id = memberships.member_id
      and members.user_id = auth.uid()
  )
);

create policy "Admins can manage membership reminders"
on public.membership_reminders
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage waitlist entries"
on public.waitlist_entries
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage payments"
on public.payments
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read their payments"
on public.payments
for select
using (
  exists (
    select 1
    from public.members
    where members.id = payments.member_id
      and members.user_id = auth.uid()
  )
);

create policy "Admins can manage routines"
on public.routines
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage routine assignments"
on public.routine_assignments
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read assigned routines"
on public.routine_assignments
for select
using (
  exists (
    select 1
    from public.members
    where members.id = routine_assignments.member_id
      and members.user_id = auth.uid()
  )
);

create policy "Members can read exercises through assigned routines"
on public.exercises
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.routine_assignments
    join public.members on members.id = routine_assignments.member_id
    where routine_assignments.routine_id = exercises.routine_id
      and routine_assignments.is_current = true
      and members.user_id = auth.uid()
  )
);

create policy "Admins can manage exercises"
on public.exercises
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage workout logs"
on public.workout_logs
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Members can create own workout logs"
on public.workout_logs
for insert
with check (
  exists (
    select 1
    from public.members
    where members.id = workout_logs.member_id
      and members.user_id = auth.uid()
  )
);

create policy "Members can read own workout logs"
on public.workout_logs
for select
using (
  exists (
    select 1
    from public.members
    where members.id = workout_logs.member_id
      and members.user_id = auth.uid()
  )
);

create policy "Admins can manage progress"
on public.progress_entries
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Members can manage own progress"
on public.progress_entries
for all
using (
  exists (
    select 1
    from public.members
    where members.id = progress_entries.member_id
      and members.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.members
    where members.id = progress_entries.member_id
      and members.user_id = auth.uid()
  )
);

create policy "Everyone signed in can read active motivational messages"
on public.motivational_messages
for select
using (auth.uid() is not null and is_active = true);

create policy "Admins can manage motivational messages"
on public.motivational_messages
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage achievements"
on public.achievements
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Members can read own achievements"
on public.achievements
for select
using (
  exists (
    select 1
    from public.members
    where members.id = achievements.member_id
      and members.user_id = auth.uid()
  )
);
