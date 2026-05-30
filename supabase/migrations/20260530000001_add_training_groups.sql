create table if not exists public.training_groups (
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

alter table public.members
add column if not exists group_id uuid
references public.training_groups(id) on delete set null;

alter table public.training_groups enable row level security;

drop policy if exists "Admins can manage training groups" on public.training_groups;
create policy "Admins can manage training groups"
on public.training_groups
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Signed in users can read active training groups" on public.training_groups;
create policy "Signed in users can read active training groups"
on public.training_groups
for select
using (auth.uid() is not null and is_active = true);
