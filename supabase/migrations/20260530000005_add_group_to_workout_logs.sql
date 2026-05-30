alter table public.workout_logs
add column if not exists group_id uuid references public.training_groups(id) on delete set null;

update public.workout_logs
set group_id = members.group_id
from public.members
where workout_logs.member_id = members.id
  and workout_logs.group_id is null;

create index if not exists workout_logs_group_completed_at_idx
on public.workout_logs (group_id, completed_at desc);
