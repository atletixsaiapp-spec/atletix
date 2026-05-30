import type { MembershipStatus } from "@/lib/atletix-data";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

export type AdminDashboardMember = {
  avatarUrl: string | null;
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

export type AdminMembersListData = {
  isConfigured: boolean;
  members: AdminDashboardMember[];
  page: number;
  pageCount: number;
  pageSize: number;
  query: string;
  setupMessage?: string;
  totalMembers: number;
};

export type AdminMembersListOptions = {
  page?: number;
  pageSize?: number;
  query?: string;
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
  user_id: string | null;
};

type MembershipRow = {
  end_date: string;
  member_id: string;
  start_date: string;
  status: MembershipStatus;
};

type PaymentRow = {
  amount_cop: number | null;
  paid_at: string;
  status: "pending" | "approved" | "rejected";
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

export async function getAdminMembersList({
  page = 1,
  pageSize = 10,
  query = "",
}: AdminMembersListOptions = {}): Promise<AdminMembersListData> {
  const normalizedQuery = normalizeMemberSearchQuery(query);
  const safePageSize = Math.min(50, Math.max(1, Math.trunc(pageSize)));
  const requestedPage = Math.max(1, Math.trunc(page));

  if (!hasSupabaseAdminConfig()) {
    return {
      isConfigured: false,
      members: [],
      page: 1,
      pageCount: 1,
      pageSize: safePageSize,
      query: normalizedQuery,
      setupMessage:
        "Falta SUPABASE_SERVICE_ROLE_KEY para leer cuentas reales.",
      totalMembers: 0,
    };
  }

  try {
    const supabase = createAdminClient();
    const from = (requestedPage - 1) * safePageSize;
    const to = from + safePageSize - 1;
    let membersQuery = supabase
      .from("members")
      .select(
        "id,user_id,full_name,email,phone,goal,joined_at,current_weight_kg,initial_weight_kg,is_active",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    const searchFilter = getMemberSearchFilter(normalizedQuery);

    if (searchFilter) {
      membersQuery = membersQuery.or(searchFilter);
    }

    const membersResult = await membersQuery;

    if (membersResult.error) {
      throw membersResult.error;
    }

    const totalMembers = membersResult.count ?? 0;
    const pageCount = Math.max(1, Math.ceil(totalMembers / safePageSize));
    const safePage = Math.min(requestedPage, pageCount);

    if (safePage !== requestedPage) {
      return getAdminMembersList({
        page: safePage,
        pageSize: safePageSize,
        query: normalizedQuery,
      });
    }

    const members = (membersResult.data ?? []) as MemberRow[];
    const memberIds = members.map((member) => member.id);
    const [memberships, avatarUrls] = await Promise.all([
      memberIds.length
        ? getLatestMembershipsForMembers(memberIds)
        : new Map<string, MembershipRow>(),
      getProfileAvatarUrlsForMembers(members),
    ]);

    return {
      isConfigured: true,
      members: members.map((member) =>
        mapAdminDashboardMember({
          avatarUrl: member.user_id
            ? avatarUrls.get(member.user_id) ?? null
            : null,
          member,
          membership: memberships.get(member.id),
        }),
      ),
      page: safePage,
      pageCount,
      pageSize: safePageSize,
      query: normalizedQuery,
      totalMembers,
    };
  } catch (error) {
    return {
      isConfigured: true,
      members: [],
      page: 1,
      pageCount: 1,
      pageSize: safePageSize,
      query: normalizedQuery,
      setupMessage:
        error instanceof Error
          ? `No se pudieron leer cuentas: ${error.message}`
          : "No se pudieron leer cuentas.",
      totalMembers: 0,
    };
  }
}

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
          "id,user_id,full_name,email,phone,goal,joined_at,current_weight_kg,initial_weight_kg,is_active",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("memberships")
        .select("member_id,start_date,end_date,status")
        .order("end_date", { ascending: false }),
      supabase.from("payments").select("amount_cop,paid_at,status"),
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
    const avatarUrls = await getProfileAvatarUrlsForMembers(members);

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

    const dashboardMembers = members.map((member) =>
      mapAdminDashboardMember({
        avatarUrl: member.user_id ? avatarUrls.get(member.user_id) ?? null : null,
        member,
        membership: latestMembershipByMember.get(member.id),
        routine: currentRoutineByMember.get(member.id),
        weeklyCompleted: weeklyWorkoutCountByMember.get(member.id) ?? 0,
      }),
    );

    const statuses = dashboardMembers.map((member) => member.status);
    const approvedPayments = payments.filter(
      (payment) => payment.status === "approved",
    );
    const revenueToday = approvedPayments
      .filter((payment) => payment.paid_at === todayKey)
      .reduce((sum, payment) => sum + (payment.amount_cop ?? 0), 0);
    const revenueMonth = approvedPayments
      .filter((payment) => payment.paid_at.startsWith(monthKey))
      .reduce((sum, payment) => sum + (payment.amount_cop ?? 0), 0);

    return {
      attentionMembers: dashboardMembers.filter(
        (member) => member.status === "expired" || member.status === "expiring",
      ),
      isConfigured: true,
      members: dashboardMembers,
      stats: {
        activeMembers: statuses.filter((status) => status === "active").length,
        expiredMembers: statuses.filter((status) => status === "expired")
          .length,
        expiringMembers: statuses.filter((status) => status === "expiring")
          .length,
        newMembers: members.filter((member) =>
          member.joined_at.startsWith(monthKey),
        ).length,
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

async function getLatestMembershipsForMembers(memberIds: string[]) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("member_id,start_date,end_date,status")
    .in("member_id", memberIds)
    .order("end_date", { ascending: false });

  if (error) {
    throw error;
  }

  const latestMembershipByMember = new Map<string, MembershipRow>();
  ((data ?? []) as MembershipRow[]).forEach((membership) => {
    if (!latestMembershipByMember.has(membership.member_id)) {
      latestMembershipByMember.set(membership.member_id, membership);
    }
  });

  return latestMembershipByMember;
}

function mapAdminDashboardMember({
  avatarUrl = null,
  member,
  membership,
  routine,
  weeklyCompleted = 0,
}: {
  avatarUrl?: string | null;
  member: MemberRow;
  membership?: MembershipRow;
  routine?: RoutineRow;
  weeklyCompleted?: number;
}): AdminDashboardMember {
  const status = getMembershipStatusFromDate(membership?.end_date ?? null);

  return {
    avatarUrl,
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
}

async function getProfileAvatarUrlsForMembers(members: MemberRow[]) {
  const userIds = Array.from(
    new Set(
      members
        .map((member) => member.user_id)
        .filter((userId): userId is string => Boolean(userId)),
    ),
  );

  if (!userIds.length) {
    return new Map<string, string | null>();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,avatar_url")
    .in("id", userIds);

  if (error) {
    return new Map<string, string | null>();
  }

  return new Map(
    ((data ?? []) as { avatar_url: string | null; id: string }[]).map(
      (profile) => [profile.id, profile.avatar_url],
    ),
  );
}

function normalizeMemberSearchQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").slice(0, 80);
}

function getMemberSearchFilter(query: string) {
  if (!query) {
    return null;
  }

  const pattern = query.replace(/[,%]/g, " ").trim().replace(/\s+/g, "%");

  if (!pattern) {
    return null;
  }

  return [
    `full_name.ilike.%${pattern}%`,
    `email.ilike.%${pattern}%`,
    `phone.ilike.%${pattern}%`,
    `goal.ilike.%${pattern}%`,
  ].join(",");
}

export function getMembershipStatusFromDate(
  date: string | null,
): MembershipStatus {
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
