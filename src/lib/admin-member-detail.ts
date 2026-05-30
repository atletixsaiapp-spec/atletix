import type { MembershipStatus } from "@/lib/atletix-data";
import { getMembershipStatusFromDate } from "@/lib/admin-data";
import { mapTrainingGroup, type TrainingGroup } from "@/lib/training-groups";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

export type MembershipPlan = {
  code: string;
  description: string | null;
  id: string;
  isActive: boolean;
  lessonsPerMonth: number;
  name: string;
  sortOrder: number;
};

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
  member: {
    age: number | null;
    avatarUrl: string | null;
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
    group: TrainingGroup | null;
    groupId: string | null;
    membershipPlan: MembershipPlan | null;
    membershipPlanId: string | null;
    name: string;
    phone: string;
    streakDays: number;
    userId: string | null;
    xp: number;
  };
  membership: {
    endDate: string;
    id: string;
    membershipPlan: MembershipPlan | null;
    membershipPlanId: string | null;
    startDate: string;
    status: MembershipStatus;
  } | null;
  membershipPlans: MembershipPlan[];
  payments: {
    amountCop: number | null;
    createdAt: string;
    id: string;
    method: string;
    notes: string | null;
    paidAt: string;
    periodEnd: string | null;
    periodStart: string | null;
    reviewedAt: string | null;
    screenshotUrl: string | null;
    source: string;
    status: "pending" | "approved" | "rejected";
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
  trainingGroups: TrainingGroup[];
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
  group_id: string | null;
  height_cm: number | null;
  id: string;
  initial_weight_kg: number | null;
  is_active: boolean;
  joined_at: string;
  level: string;
  membership_plan_id: string | null;
  phone: string | null;
  streak_days: number;
  user_id: string | null;
  xp: number;
};

type MembershipRow = {
  end_date: string;
  id: string;
  membership_plan_id: string | null;
  start_date: string;
};

type MembershipPlanRow = {
  code: string;
  description: string | null;
  id: string;
  is_active: boolean;
  lessons_per_month: number;
  name: string;
  sort_order: number;
};

type TrainingGroupRow = {
  capacity: number;
  id: string;
  is_active: boolean;
  name: string;
  sort_order: number;
  start_time: string;
};

type MemberGroupRow = {
  group_id: string | null;
  is_active: boolean;
};

type PaymentRow = {
  amount_cop: number | null;
  created_at: string;
  id: string;
  method: string;
  notes: string | null;
  paid_at: string;
  period_end: string | null;
  period_start: string | null;
  reviewed_at: string | null;
  screenshot_url: string | null;
  source: string;
  status: "pending" | "approved" | "rejected";
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
        "Falta SUPABASE_SERVICE_ROLE_KEY para leer datos reales de este perfil.",
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
      membershipPlansResult,
      trainingGroupsResult,
      memberGroupsResult,
    ] = await Promise.all([
      supabase
        .from("members")
        .select(
          "id,user_id,membership_plan_id,group_id,full_name,email,phone,date_of_birth,height_cm,initial_weight_kg,current_weight_kg,goal,joined_at,level,xp,streak_days,is_active",
        )
        .eq("id", memberId)
        .maybeSingle(),
      supabase
        .from("memberships")
        .select("id,membership_plan_id,start_date,end_date")
        .eq("member_id", memberId)
        .order("end_date", { ascending: false }),
      supabase
        .from("payments")
        .select(
          "id,amount_cop,paid_at,period_start,period_end,method,source,status,screenshot_url,notes,reviewed_at,created_at",
        )
        .eq("member_id", memberId)
        .order("paid_at", { ascending: false })
        .order("created_at", { ascending: false }),
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
      supabase
        .from("membership_plans")
        .select(
          "id,code,name,lessons_per_month,description,is_active,sort_order",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("training_groups")
        .select("id,name,start_time,capacity,is_active,sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("start_time", { ascending: true }),
      supabase
        .from("members")
        .select("group_id,is_active")
        .eq("is_active", true),
    ]);

    const firstError =
      memberResult.error ??
      membershipsResult.error ??
      paymentsResult.error ??
      workoutLogsResult.error ??
      progressResult.error ??
      routineAssignmentsResult.error ??
      achievementsResult.error ??
      membershipPlansResult.error ??
      trainingGroupsResult.error ??
      memberGroupsResult.error;

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
    const routineAssignment = (
      (routineAssignmentsResult.data ?? []) as RoutineAssignmentRow[]
    )[0];
    const routine = routineAssignment
      ? await loadRoutine(routineAssignment.routine_id)
      : null;
    const memberships = (membershipsResult.data ?? []) as MembershipRow[];
    const payments = (paymentsResult.data ?? []) as PaymentRow[];
    const approvedPayments = payments.filter(
      (payment) => payment.status === "approved",
    );
    const workoutLogs = (workoutLogsResult.data ?? []) as WorkoutLogRow[];
    const progress = (progressResult.data ?? []) as ProgressRow[];
    const achievements = (achievementsResult.data ?? []) as AchievementRow[];
    const membershipPlans = (
      (membershipPlansResult.data ?? []) as MembershipPlanRow[]
    ).map(mapMembershipPlan);
    const membershipPlanById = new Map(
      membershipPlans.map((plan) => [plan.id, plan]),
    );
    const memberCountByGroup = new Map<string, number>();
    ((memberGroupsResult.data ?? []) as MemberGroupRow[]).forEach((row) => {
      if (row.group_id) {
        memberCountByGroup.set(
          row.group_id,
          (memberCountByGroup.get(row.group_id) ?? 0) + 1,
        );
      }
    });
    const trainingGroups = (
      (trainingGroupsResult.data ?? []) as TrainingGroupRow[]
    ).map((group) =>
      mapTrainingGroup(group, memberCountByGroup.get(group.id) ?? 0),
    );
    const trainingGroupById = new Map(
      trainingGroups.map((group) => [group.id, group]),
    );
    const latestMembership = memberships[0] ?? null;
    const memberPlan = member.membership_plan_id
      ? (membershipPlanById.get(member.membership_plan_id) ?? null)
      : null;
    const latestMembershipPlan = latestMembership?.membership_plan_id
      ? (membershipPlanById.get(latestMembership.membership_plan_id) ?? null)
      : memberPlan;
    const avatarUrl = await loadProfileAvatarUrl(member.user_id);
    const latestProgress = progress[progress.length - 1];
    const latestWeightKg =
      member.current_weight_kg ??
      latestProgress?.weight_kg ??
      member.initial_weight_kg;
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
        member: {
          age: member.date_of_birth ? calculateAge(member.date_of_birth) : null,
          avatarUrl,
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
          group: member.group_id
            ? (trainingGroupById.get(member.group_id) ?? null)
            : null,
          groupId: member.group_id,
          membershipPlan: memberPlan,
          membershipPlanId: member.membership_plan_id,
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
              membershipPlan: latestMembershipPlan,
              membershipPlanId: latestMembership.membership_plan_id,
              startDate: latestMembership.start_date,
              status: getMembershipStatusFromDate(latestMembership.end_date),
            }
          : null,
        membershipPlans,
        payments: payments.map((payment) => ({
          amountCop: payment.amount_cop,
          createdAt: payment.created_at,
          id: payment.id,
          method: payment.method,
          notes: payment.notes,
          paidAt: payment.paid_at,
          periodEnd: payment.period_end,
          periodStart: payment.period_start,
          reviewedAt: payment.reviewed_at,
          screenshotUrl: payment.screenshot_url,
          source: payment.source,
          status: payment.status,
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
        trainingGroups,
        stats: {
          attendanceMonth: workoutLogs.filter((log) =>
            log.completed_at.startsWith(monthKey),
          ).length,
          attendanceWeek: workoutLogs.filter(
            (log) => new Date(log.completed_at) >= weekStart,
          ).length,
          lastPaymentCop: approvedPayments[0]?.amount_cop ?? 0,
          latestWeightKg,
          progressEntries: progress.length,
          totalPaidCop: approvedPayments.reduce(
            (total, payment) => total + (payment.amount_cop ?? 0),
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
          : "No se pudo leer la ficha del perfil.",
    };
  }
}

async function loadProfileAvatarUrl(userId: string | null) {
  if (!userId) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.avatar_url ?? null;
}

function mapMembershipPlan(plan: MembershipPlanRow): MembershipPlan {
  return {
    code: plan.code,
    description: plan.description,
    id: plan.id,
    isActive: plan.is_active,
    lessonsPerMonth: plan.lessons_per_month,
    name: plan.name,
    sortOrder: plan.sort_order,
  };
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
    coachNotes: routine.coach_notes ?? "Sin notas del equipo.",
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
