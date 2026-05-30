create table if not exists public.membership_plans (
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

alter table public.members
add column if not exists membership_plan_id uuid
references public.membership_plans(id) on delete set null;

alter table public.memberships
add column if not exists membership_plan_id uuid
references public.membership_plans(id) on delete set null;

alter table public.membership_plans enable row level security;

drop policy if exists "Admins can manage membership plans" on public.membership_plans;
create policy "Admins can manage membership plans"
on public.membership_plans
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Signed in users can read active membership plans" on public.membership_plans;
create policy "Signed in users can read active membership plans"
on public.membership_plans
for select
using (auth.uid() is not null and is_active = true);
