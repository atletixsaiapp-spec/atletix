import type { AdminMemberDetail } from "@/lib/admin-member-detail";
import { getAdminMemberDetail } from "@/lib/admin-member-detail";
import type { MemberOnboardingRecord } from "@/lib/auth";

export type MemberDashboardData = AdminMemberDetail & {
  loadMessage: string | null;
};

export async function getMemberDashboardData(
  member: MemberOnboardingRecord,
): Promise<MemberDashboardData> {
  const detail = await getAdminMemberDetail(member.id);

  if (detail.member) {
    return {
      ...detail.member,
      loadMessage: detail.setupMessage ?? null,
    };
  }

  return {
    ...buildFallbackDashboard(member),
    loadMessage:
      detail.setupMessage ??
      "Tu perfil existe, pero aun no pudimos leer todos tus datos conectados.",
  };
}

function buildFallbackDashboard(member: MemberOnboardingRecord): AdminMemberDetail {
  const today = new Date().toISOString().slice(0, 10);
  const latestWeightKg = member.current_weight_kg ?? member.initial_weight_kg;
  const weightChangeKg =
    latestWeightKg !== null && member.initial_weight_kg !== null
      ? Number((latestWeightKg - member.initial_weight_kg).toFixed(1))
      : null;

  return {
    achievements: [],
    attendanceChart: buildEmptyAttendanceChart(),
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
      isActive: false,
      joinedAt: today,
      level: "Rookie",
      name: member.full_name,
      phone: member.phone ?? "",
      streakDays: 0,
      userId: null,
      xp: 0,
    },
    membership: null,
    payments: [],
    progress: latestWeightKg
      ? [
          {
            armCm: null,
            date: today,
            hipCm: null,
            id: "current-weight",
            legCm: null,
            waistCm: null,
            weightKg: latestWeightKg,
          },
        ]
      : [],
    routine: null,
    stats: {
      attendanceMonth: 0,
      attendanceWeek: 0,
      lastPaymentCop: 0,
      latestWeightKg,
      progressEntries: latestWeightKg ? 1 : 0,
      totalPaidCop: 0,
      weightChangeKg,
    },
  };
}

function buildEmptyAttendanceChart() {
  const formatter = new Intl.DateTimeFormat("es-CO", { weekday: "short" });

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));

    return {
      count: 0,
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
