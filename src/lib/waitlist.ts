import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

export type WaitlistStatus = "pending" | "invited" | "archived";

export type WaitlistEntry = {
  createdAt: string;
  dateOfBirth: string;
  email: string;
  fullName: string;
  id: string;
  invitedAt: string | null;
  invitedMemberId: string | null;
  notes: string | null;
  phone: string;
  preferredGroupId: string | null;
  status: WaitlistStatus;
};

export type WaitlistEntriesResult = {
  entries: WaitlistEntry[];
  isConfigured: boolean;
  setupMessage?: string;
};

type WaitlistEntryRow = {
  created_at: string;
  date_of_birth: string;
  email: string;
  full_name: string;
  id: string;
  invited_at: string | null;
  invited_member_id: string | null;
  notes: string | null;
  phone: string;
  preferred_group_id: string | null;
  status: WaitlistStatus;
};

export async function getWaitlistEntries(): Promise<WaitlistEntriesResult> {
  if (!hasSupabaseAdminConfig()) {
    return {
      entries: [],
      isConfigured: false,
      setupMessage:
        "Falta SUPABASE_SERVICE_ROLE_KEY para leer la lista de espera.",
    };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("waitlist_entries")
      .select(
        "id,full_name,email,phone,date_of_birth,preferred_group_id,notes,status,invited_member_id,invited_at,created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      entries: ((data ?? []) as WaitlistEntryRow[]).map(mapWaitlistEntry),
      isConfigured: true,
    };
  } catch (error) {
    return {
      entries: [],
      isConfigured: true,
      setupMessage:
        error instanceof Error
          ? `No se pudo leer la lista de espera: ${error.message}`
          : "No se pudo leer la lista de espera.",
    };
  }
}

function mapWaitlistEntry(row: WaitlistEntryRow): WaitlistEntry {
  return {
    createdAt: row.created_at,
    dateOfBirth: row.date_of_birth,
    email: row.email,
    fullName: row.full_name,
    id: row.id,
    invitedAt: row.invited_at,
    invitedMemberId: row.invited_member_id,
    notes: row.notes,
    phone: row.phone,
    preferredGroupId: row.preferred_group_id,
    status: row.status,
  };
}
