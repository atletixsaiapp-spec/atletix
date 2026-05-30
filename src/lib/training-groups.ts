import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

export type TrainingGroup = {
  availableSeats: number;
  capacity: number;
  id: string;
  isActive: boolean;
  memberCount: number;
  name: string;
  sortOrder: number;
  startTime: string;
};

export type TrainingGroupRow = {
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

export type TrainingGroupsResult = {
  groups: TrainingGroup[];
  isConfigured: boolean;
  setupMessage?: string;
};

export async function getTrainingGroups({
  activeOnly = false,
}: {
  activeOnly?: boolean;
} = {}): Promise<TrainingGroupsResult> {
  if (!hasSupabaseAdminConfig()) {
    return {
      groups: [],
      isConfigured: false,
      setupMessage:
        "Falta SUPABASE_SERVICE_ROLE_KEY para leer grupos reales.",
    };
  }

  try {
    const supabase = createAdminClient();
    let groupsQuery = supabase
      .from("training_groups")
      .select("id,name,start_time,capacity,is_active,sort_order")
      .order("sort_order", { ascending: true })
      .order("start_time", { ascending: true });

    if (activeOnly) {
      groupsQuery = groupsQuery.eq("is_active", true);
    }

    const [groupsResult, membersResult] = await Promise.all([
      groupsQuery,
      supabase.from("members").select("group_id,is_active").eq("is_active", true),
    ]);

    const firstError = groupsResult.error ?? membersResult.error;

    if (firstError) {
      console.error("ATLETIX training groups lookup failed", firstError);

      throw firstError;
    }

    const memberCountByGroup = new Map<string, number>();
    ((membersResult.data ?? []) as MemberGroupRow[]).forEach((member) => {
      if (member.group_id) {
        memberCountByGroup.set(
          member.group_id,
          (memberCountByGroup.get(member.group_id) ?? 0) + 1,
        );
      }
    });

    return {
      groups: ((groupsResult.data ?? []) as TrainingGroupRow[]).map((group) =>
        mapTrainingGroup(group, memberCountByGroup.get(group.id) ?? 0),
      ),
      isConfigured: true,
    };
  } catch (error) {
    const message = getErrorMessage(error);

    return {
      groups: [],
      isConfigured: true,
      setupMessage: message
        ? `No se pudieron leer grupos: ${message}`
        : "No se pudieron leer grupos.",
    };
  }
}

export async function getAvailableTrainingGroups() {
  const result = await getTrainingGroups({ activeOnly: true });

  return {
    ...result,
    groups: result.groups.filter((group) => group.availableSeats > 0),
  };
}

export function mapTrainingGroup(
  group: TrainingGroupRow,
  memberCount: number,
): TrainingGroup {
  return {
    availableSeats: Math.max(0, group.capacity - memberCount),
    capacity: group.capacity,
    id: group.id,
    isActive: group.is_active,
    memberCount,
    name: group.name,
    sortOrder: group.sort_order,
    startTime: group.start_time,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    return typeof message === "string" ? message : null;
  }

  return null;
}
