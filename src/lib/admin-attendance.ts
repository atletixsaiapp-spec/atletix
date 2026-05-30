import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

export type AttendanceMember = {
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  phone: string;
};

export type TodayAttendanceLog = {
  completedAt: string;
  id: string;
  memberId: string;
  memberName: string;
};

export type AdminAttendanceData = {
  isConfigured: boolean;
  members: AttendanceMember[];
  setupMessage?: string;
  todayLogs: TodayAttendanceLog[];
};

type MemberRow = {
  email: string;
  full_name: string;
  id: string;
  is_active: boolean;
  phone: string | null;
};

type WorkoutLogRow = {
  completed_at: string;
  id: string;
  member_id: string;
};

export async function getAdminAttendanceData(): Promise<AdminAttendanceData> {
  if (!hasSupabaseAdminConfig()) {
    return {
      isConfigured: false,
      members: [],
      setupMessage:
        "Falta SUPABASE_SERVICE_ROLE_KEY para registrar asistencia real.",
      todayLogs: [],
    };
  }

  try {
    const supabase = createAdminClient();
    const { start, end } = getBogotaDayRange(new Date());
    const [membersResult, logsResult] = await Promise.all([
      supabase
        .from("members")
        .select("id,full_name,email,phone,is_active")
        .order("full_name", { ascending: true }),
      supabase
        .from("workout_logs")
        .select("id,member_id,completed_at")
        .gte("completed_at", start.toISOString())
        .lt("completed_at", end.toISOString())
        .order("completed_at", { ascending: false }),
    ]);

    const firstError = membersResult.error ?? logsResult.error;

    if (firstError) {
      throw firstError;
    }

    const members = ((membersResult.data ?? []) as MemberRow[]).map((member) => ({
      email: member.email,
      id: member.id,
      isActive: member.is_active,
      name: member.full_name,
      phone: member.phone ?? "",
    }));
    const memberById = new Map(members.map((member) => [member.id, member]));

    return {
      isConfigured: true,
      members,
      todayLogs: ((logsResult.data ?? []) as WorkoutLogRow[]).map((log) => ({
        completedAt: log.completed_at,
        id: log.id,
        memberId: log.member_id,
        memberName: memberById.get(log.member_id)?.name ?? "Cuenta eliminada",
      })),
    };
  } catch (error) {
    return {
      isConfigured: true,
      members: [],
      setupMessage:
        error instanceof Error
          ? `No se pudo leer asistencia: ${error.message}`
          : "No se pudo leer asistencia.",
      todayLogs: [],
    };
  }
}

export function getBogotaDayRange(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Bogota",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const start = new Date(`${values.year}-${values.month}-${values.day}T00:00:00-05:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return { end, start };
}
