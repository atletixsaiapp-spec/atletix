alter table public.payments
add column if not exists status text not null default 'approved' check (
  status in ('pending', 'approved', 'rejected')
),
add column if not exists screenshot_url text,
add column if not exists submitted_by uuid references public.profiles(id) on delete set null,
add column if not exists reviewed_at timestamptz;

alter table public.payments
alter column amount_cop drop not null,
alter column period_start drop not null,
alter column period_end drop not null;

alter table public.payments
drop constraint if exists payments_amount_cop_check;

alter table public.payments
add constraint payments_amount_cop_check
check (amount_cop is null or amount_cop > 0);

update public.payments
set status = 'approved'
where status is null;

create index if not exists payments_status_paid_at_idx
on public.payments (status, paid_at desc);

create index if not exists payments_member_paid_at_idx
on public.payments (member_id, paid_at desc);
