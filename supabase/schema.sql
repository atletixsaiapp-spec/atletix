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

create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
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
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status public.membership_status not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  amount_cop integer not null check (amount_cop > 0),
  paid_at date not null default current_date,
  period_start date not null,
  period_end date not null,
  method public.payment_method not null default 'transfer',
  source public.payment_source not null default 'whatsapp',
  notes text,
  confirmed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

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
alter table public.members enable row level security;
alter table public.memberships enable row level security;
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
