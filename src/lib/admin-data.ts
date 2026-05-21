import type { MembershipStatus } from "@/lib/atletix-data";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

export type AdminDashboardMember = {
  email: string;
  goal: string;
  id: string;
  initials: string;
  membershipEnd: string | null;
  membershipStart: string | null;
  name: string;
  phone: string;
  progressPercent: number;
  routineDay: string;
  routineName: string;
  status: MembershipStatus;
  weeklyCompleted: number;
};

export type AdminDashboardData = {
  attentionMembers: AdminDashboardMember[];
  isConfigured: boolean;
  members: AdminDashboardMember[];
  setupMessage?: string;
  stats: {
    activeMembers: number;
    expiredMembers: number;
    expiringMembers: number;
    newMembers: number;
    revenueMonth: number;
    revenueToday: number;
    totalMembers: number;
    weeklyAttendance: number;
  };
};

type MemberRow = {
  current_weight_kg: number | null;
  email: string;
  full_name: string;
  goal: string;
  id: string;
  initial_weight_kg: number | null;
  is_active: boolean;
  joined_at: string;
  phone: string | null;
};

type MembershipRow = {
  end_date: string;
  member_id: string;
  start_date: string;
  status: MembershipStatus;
};

type PaymentRow = {
  amount_cop: number;
  paid_at: string;
};

type WorkoutLogRow = {
  completed_at: string;
  member_id: string;
};

type RoutineAssignmentRow = {
  member_id: string;
  routine_id: string;
};

type RoutineRow = {
  day_name: string;
  id: string;
  name: string;
};

const emptyStats = {
  activeMembers: 0,
  expiredMembers: 0,
  expiringMembers: 0,
  newMembers: 0,
  revenueMonth: 0,
  revenueToday: 0,
  totalMembers: 0,
  weeklyAttendance: 0,
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!hasSupabaseAdminConfig()) {
    return {
      attentionMembers: [],
      isConfigured: false,
      members: [],
      setupMessage:
        "Falta SUPABASE_SERVICE_ROLE_KEY para leer datos reales del panel admin.",
      stats: emptyStats,
    };
  }

  try {
    const supabase = createAdminClient();
    const [
      membersResult,
      membershipsResult,
      paymentsResult,
      workoutLogsResult,
      routineAssignmentsResult,
      routinesResult,
    ] = await Promise.all([
      supabase
        .from("members")
        .select(
          "id,full_name,email,phone,goal,joined_at,current_weight_kg,initial_weight_kg,is_active",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("memberships")
        .select("member_id,start_date,end_date,status")
        .order("end_date", { ascending: false }),
      supabase.from("payments").select("amount_cop,paid_at"),
      supabase.from("workout_logs").select("member_id,completed_at"),
      supabase
        .from("routine_assignments")
        .select("member_id,routine_id")
        .eq("is_current", true),
      supabase.from("routines").select("id,name,day_name"),
    ]);

    const firstError =
      membersResult.error ??
      membershipsResult.error ??
      paymentsResult.error ??
      workoutLogsResult.error ??
      routineAssignmentsResult.error ??
      routinesResult.error;

    if (firstError) {
      throw firstError;
    }

    const members = (membersResult.data ?? []) as MemberRow[];
    const memberships = (membershipsResult.data ?? []) as MembershipRow[];
    const payments = (paymentsResult.data ?? []) as PaymentRow[];
    const workoutLogs = (workoutLogsResult.data ?? []) as WorkoutLogRow[];
    const routineAssignments = (routineAssignmentsResult.data ??
      []) as RoutineAssignmentRow[];
    const routines = (routinesResult.data ?? []) as RoutineRow[];

    const latestMembershipByMember = new Map<string, MembershipRow>();
    memberships.forEach((membership) => {
      if (!latestMembershipByMember.has(membership.member_id)) {
        latestMembershipByMember.set(membership.member_id, membership);
      }
    });

    const routineById = new Map<string, RoutineRow>();
    routines.forEach((routine) => {
      routineById.set(routine.id, routine);
    });

    const currentRoutineByMember = new Map<string, RoutineRow>();
    routineAssignments.forEach((assignment) => {
      const routine = routineById.get(assignment.routine_id);

      if (routine && !currentRoutineByMember.has(assignment.member_id)) {
        currentRoutineByMember.set(assignment.member_id, routine);
      }
    });

    const weekStart = getWeekStart();
    const todayKey = dateKey(new Date());
    const monthKey = todayKey.slice(0, 7);

    const weeklyWorkoutCountByMember = new Map<string, number>();
    workoutLogs.forEach((log) => {
      const completedAt = new Date(log.completed_at);

      if (completedAt >= weekStart) {
        weeklyWorkoutCountByMember.set(
          log.member_id,
          (weeklyWorkoutCountByMember.get(log.member_id) ?? 0) + 1,
        );
      }
    });

    const dashboardMembers = members.map((member) => {
      const membership = latestMembershipByMember.get(member.id);
      const status = getMembershipStatusFromDate(membership?.end_date ?? null);
      const weeklyCompleted = weeklyWorkoutCountByMember.get(member.id) ?? 0;
      const routine = currentRoutineByMember.get(member.id);

      return {
        email: member.email,
        goal: member.goal,
        id: member.id,
        initials: getInitials(member.full_name),
        membershipEnd: membership?.end_date ?? null,
        membershipStart: membership?.start_date ?? null,
        name: member.full_name,
        phone: member.phone ?? "",
        progressPercent: Math.min(100, Math.round((weeklyCompleted / 5) * 100)),
        routineDay: routine?.day_name ?? "Sin dia",
        routineName: routine?.name ?? "Sin rutina",
        status,
        weeklyCompleted,
      };
    });

    const statuses = dashboardMembers.map((member) => member.status);
    const revenueToday = payments
      .filter((payment) => payment.paid_at === todayKey)
      .reduce((sum, payment) => sum + payment.amount_cop, 0);
    const revenueMonth = payments
      .filter((payment) => payment.paid_at.startsWith(monthKey))
      .reduce((sum, payment) => sum + payment.amount_cop, 0);

    return {
      attentionMembers: dashboardMembers.filter(
        (member) => member.status === "expired" || member.status === "expiring",
      ),
      isConfigured: true,
      members: dashboardMembers,
      stats: {
        activeMembers: statuses.filter((status) => status === "active").length,
        expiredMembers: statuses.filter((status) => status === "expired").length,
        expiringMembers: statuses.filter((status) => status === "expiring").length,
        newMembers: members.filter((member) => member.joined_at.startsWith(monthKey))
          .length,
        revenueMonth,
        revenueToday,
        totalMembers: dashboardMembers.length,
        weeklyAttendance: workoutLogs.filter(
          (log) => new Date(log.completed_at) >= weekStart,
        ).length,
      },
    };
  } catch (error) {
    return {
      attentionMembers: [],
      isConfigured: true,
      members: [],
      setupMessage:
        error instanceof Error
          ? `No se pudo leer Supabase: ${error.message}`
          : "No se pudo leer Supabase.",
      stats: emptyStats,
    };
  }
}

export function getMembershipStatusFromDate(date: string | null): MembershipStatus {
  if (!date) {
    return "expired";
  }

  const diff = getDaysUntil(date);

  if (diff < 0) {
    return "expired";
  }

  if (diff <= 3) {
    return "expiring";
  }

  return "active";
}

export function getDaysUntil(date: string) {
  const target = new Date(`${date}T23:59:59-05:00`);
  const ms = target.getTime() - Date.now();

  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function getWeekStart() {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(date.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}

function dateKey(date: Date) {
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
