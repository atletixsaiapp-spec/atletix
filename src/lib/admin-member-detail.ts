import type { MembershipStatus } from "@/lib/atletix-data";
import { getMembershipStatusFromDate } from "@/lib/admin-data";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

export type AdminMemberDetail = {
  achievements: {
    id: string;
    title: string;
    unlockedAt: string;
    xpAwarded: number;
  }[];
  attendanceChart: {
    count: number;
    label: string;
  }[];
  gender: string;
  member: {
    age: number | null;
    currentWeightKg: number | null;
    dateOfBirth: string | null;
    email: string;
    goal: string;
    heightCm: number | null;
    id: string;
    initialWeightKg: number | null;
    initials: string;
    isActive: boolean;
    joinedAt: string;
    level: string;
    name: string;
    phone: string;
    streakDays: number;
    userId: string | null;
    xp: number;
  };
  membership: {
    endDate: string;
    id: string;
    startDate: string;
    status: MembershipStatus;
  } | null;
  payments: {
    amountCop: number;
    id: string;
    method: string;
    notes: string | null;
    paidAt: string;
    periodEnd: string;
    periodStart: string;
    source: string;
  }[];
  progress: {
    armCm: number | null;
    date: string;
    hipCm: number | null;
    id: string;
    legCm: number | null;
    waistCm: number | null;
    weightKg: number | null;
  }[];
  routine: {
    coachNotes: string;
    dayName: string;
    exercises: {
      coachNote: string;
      id: string;
      load: string;
      name: string;
      reps: string;
      sets: string;
    }[];
    id: string;
    name: string;
  } | null;
  stats: {
    attendanceMonth: number;
    attendanceWeek: number;
    lastPaymentCop: number;
    latestWeightKg: number | null;
    progressEntries: number;
    totalPaidCop: number;
    weightChangeKg: number | null;
  };
};

type AdminMemberDetailResult = {
  isConfigured: boolean;
  member: AdminMemberDetail | null;
  setupMessage?: string;
};

type MemberRow = {
  current_weight_kg: number | null;
  date_of_birth: string | null;
  email: string;
  full_name: string;
  goal: string;
  height_cm: number | null;
  id: string;
  initial_weight_kg: number | null;
  is_active: boolean;
  joined_at: string;
  level: string;
  phone: string | null;
  streak_days: number;
  user_id: string | null;
  xp: number;
};

type MembershipRow = {
  end_date: string;
  id: string;
  start_date: string;
};

type PaymentRow = {
  amount_cop: number;
  id: string;
  method: string;
  notes: string | null;
  paid_at: string;
  period_end: string;
  period_start: string;
  source: string;
};

type WorkoutLogRow = {
  completed_at: string;
  id: string;
};

type ProgressRow = {
  arm_cm: number | null;
  entry_date: string;
  hip_cm: number | null;
  id: string;
  leg_cm: number | null;
  waist_cm: number | null;
  weight_kg: number | null;
};

type RoutineAssignmentRow = {
  routine_id: string;
};

type RoutineRow = {
  coach_notes: string | null;
  day_name: string;
  id: string;
  name: string;
};

type ExerciseRow = {
  coach_note: string | null;
  id: string;
  load: string | null;
  name: string;
  reps: string;
  sets: string;
};

type AchievementRow = {
  id: string;
  title: string;
  unlocked_at: string;
  xp_awarded: number;
};

export async function getAdminMemberDetail(
  memberId: string,
): Promise<AdminMemberDetailResult> {
  if (!hasSupabaseAdminConfig()) {
    return {
      isConfigured: false,
      member: null,
      setupMessage:
        "Falta SUPABASE_SERVICE_ROLE_KEY para leer datos reales de esta clienta.",
    };
  }

  try {
    const supabase = createAdminClient();
    const [
      memberResult,
      membershipsResult,
      paymentsResult,
      workoutLogsResult,
      progressResult,
      routineAssignmentsResult,
      achievementsResult,
    ] = await Promise.all([
      supabase
        .from("members")
        .select(
          "id,user_id,full_name,email,phone,date_of_birth,height_cm,initial_weight_kg,current_weight_kg,goal,joined_at,level,xp,streak_days,is_active",
        )
        .eq("id", memberId)
        .maybeSingle(),
      supabase
        .from("memberships")
        .select("id,start_date,end_date")
        .eq("member_id", memberId)
        .order("end_date", { ascending: false }),
      supabase
        .from("payments")
        .select("id,amount_cop,paid_at,period_start,period_end,method,source,notes")
        .eq("member_id", memberId)
        .order("paid_at", { ascending: false }),
      supabase
        .from("workout_logs")
        .select("id,completed_at")
        .eq("member_id", memberId)
        .order("completed_at", { ascending: false }),
      supabase
        .from("progress_entries")
        .select("id,entry_date,weight_kg,waist_cm,hip_cm,leg_cm,arm_cm")
        .eq("member_id", memberId)
        .order("entry_date", { ascending: true }),
      supabase
        .from("routine_assignments")
        .select("routine_id")
        .eq("member_id", memberId)
        .eq("is_current", true)
        .limit(1),
      supabase
        .from("achievements")
        .select("id,title,xp_awarded,unlocked_at")
        .eq("member_id", memberId)
        .order("unlocked_at", { ascending: false }),
    ]);

    const firstError =
      memberResult.error ??
      membershipsResult.error ??
      paymentsResult.error ??
      workoutLogsResult.error ??
      progressResult.error ??
      routineAssignmentsResult.error ??
      achievementsResult.error;

    if (firstError) {
      throw firstError;
    }

    if (!memberResult.data) {
      return {
        isConfigured: true,
        member: null,
      };
    }

    const member = memberResult.data as MemberRow;
    const routineAssignment = ((routineAssignmentsResult.data ?? []) as RoutineAssignmentRow[])[0];
    const routine = routineAssignment
      ? await loadRoutine(routineAssignment.routine_id)
      : null;
    const memberships = (membershipsResult.data ?? []) as MembershipRow[];
    const payments = (paymentsResult.data ?? []) as PaymentRow[];
    const workoutLogs = (workoutLogsResult.data ?? []) as WorkoutLogRow[];
    const progress = (progressResult.data ?? []) as ProgressRow[];
    const achievements = (achievementsResult.data ?? []) as AchievementRow[];
    const latestMembership = memberships[0] ?? null;
    const latestProgress = progress[progress.length - 1];
    const latestWeightKg =
      member.current_weight_kg ?? latestProgress?.weight_kg ?? member.initial_weight_kg;
    const weightChangeKg =
      latestWeightKg !== null && member.initial_weight_kg !== null
        ? Number((latestWeightKg - member.initial_weight_kg).toFixed(1))
        : null;
    const weekStart = getWeekStart();
    const monthKey = dateKey(new Date()).slice(0, 7);

    return {
      isConfigured: true,
      member: {
        achievements: achievements.map((achievement) => ({
          id: achievement.id,
          title: achievement.title,
          unlockedAt: achievement.unlocked_at,
          xpAwarded: achievement.xp_awarded,
        })),
        attendanceChart: buildAttendanceChart(workoutLogs),
        gender: "No registrado",
        member: {
          age: member.date_of_birth ? calculateAge(member.date_of_birth) : null,
          currentWeightKg: latestWeightKg,
          dateOfBirth: member.date_of_birth,
          email: member.email,
          goal: member.goal,
          heightCm: member.height_cm,
          id: member.id,
          initialWeightKg: member.initial_weight_kg,
          initials: getInitials(member.full_name),
          isActive: member.is_active,
          joinedAt: member.joined_at,
          level: member.level,
          name: member.full_name,
          phone: member.phone ?? "",
          streakDays: member.streak_days,
          userId: member.user_id,
          xp: member.xp,
        },
        membership: latestMembership
          ? {
              endDate: latestMembership.end_date,
              id: latestMembership.id,
              startDate: latestMembership.start_date,
              status: getMembershipStatusFromDate(latestMembership.end_date),
            }
          : null,
        payments: payments.map((payment) => ({
          amountCop: payment.amount_cop,
          id: payment.id,
          method: payment.method,
          notes: payment.notes,
          paidAt: payment.paid_at,
          periodEnd: payment.period_end,
          periodStart: payment.period_start,
          source: payment.source,
        })),
        progress: progress.map((entry) => ({
          armCm: entry.arm_cm,
          date: entry.entry_date,
          hipCm: entry.hip_cm,
          id: entry.id,
          legCm: entry.leg_cm,
          waistCm: entry.waist_cm,
          weightKg: entry.weight_kg,
        })),
        routine,
        stats: {
          attendanceMonth: workoutLogs.filter((log) =>
            log.completed_at.startsWith(monthKey),
          ).length,
          attendanceWeek: workoutLogs.filter(
            (log) => new Date(log.completed_at) >= weekStart,
          ).length,
          lastPaymentCop: payments[0]?.amount_cop ?? 0,
          latestWeightKg,
          progressEntries: progress.length,
          totalPaidCop: payments.reduce(
            (total, payment) => total + payment.amount_cop,
            0,
          ),
          weightChangeKg,
        },
      },
    };
  } catch (error) {
    return {
      isConfigured: true,
      member: null,
      setupMessage:
        error instanceof Error
          ? `No se pudo leer la ficha: ${error.message}`
          : "No se pudo leer la ficha de la clienta.",
    };
  }
}

async function loadRoutine(routineId: string) {
  const supabase = createAdminClient();
  const [routineResult, exercisesResult] = await Promise.all([
    supabase
      .from("routines")
      .select("id,name,day_name,coach_notes")
      .eq("id", routineId)
      .maybeSingle(),
    supabase
      .from("exercises")
      .select("id,name,sets,reps,load,coach_note")
      .eq("routine_id", routineId)
      .order("sort_order", { ascending: true }),
  ]);

  if (routineResult.error || exercisesResult.error || !routineResult.data) {
    return null;
  }

  const routine = routineResult.data as RoutineRow;
  const exercises = (exercisesResult.data ?? []) as ExerciseRow[];

  return {
    coachNotes: routine.coach_notes ?? "Sin notas del entrenador.",
    dayName: routine.day_name,
    exercises: exercises.map((exercise) => ({
      coachNote: exercise.coach_note ?? "Sin nota",
      id: exercise.id,
      load: exercise.load ?? "Sin carga",
      name: exercise.name,
      reps: exercise.reps,
      sets: exercise.sets,
    })),
    id: routine.id,
    name: routine.name,
  };
}

function buildAttendanceChart(logs: WorkoutLogRow[]) {
  const formatter = new Intl.DateTimeFormat("es-CO", { weekday: "short" });

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    return {
      count: logs.filter((log) => {
        const completedAt = new Date(log.completed_at);

        return completedAt >= day && completedAt < nextDay;
      }).length,
      label: formatter.format(day).slice(0, 3),
    };
  });
}

function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(`${dateOfBirth}T12:00:00-05:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function getWeekStart() {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(date.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}

export function addOneMonth(date: Date) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);

  return next;
}

export function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
