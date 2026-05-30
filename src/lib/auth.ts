import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { createClient } from "@/utils/supabase/server";

export type MemberOnboardingRecord = {
  avatar_url: string | null;
  current_weight_kg: number | null;
  date_of_birth: string | null;
  email: string;
  full_name: string;
  goal: string;
  group_id: string | null;
  height_cm: number | null;
  id: string;
  initial_weight_kg: number | null;
  phone: string | null;
};

const memberOnboardingSelect =
  "id,full_name,email,phone,date_of_birth,height_cm,initial_weight_kg,current_weight_kg,goal,group_id";
const legacyMemberOnboardingSelect =
  "id,full_name,email,phone,date_of_birth,height_cm,initial_weight_kg,current_weight_kg,goal";

export async function requireUser() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function getAuthenticatedHomeDestination() {
  const cookieStore = await cookies();
  const adminSession = getAdminSession(cookieStore);

  if (adminSession) {
    return "/admin";
  }

  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getMemberDestination(supabase, user.id);
}

export async function getAuthenticatedMemberDestination() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getMemberDestination(supabase, user.id);
}

export async function requireOnboardedUser() {
  const session = await requireUser();
  const member = await getMemberOnboardingRecord(session.supabase, session.user.id);

  if (!isMemberOnboardingComplete(member)) {
    redirect("/onboarding");
  }

  return { ...session, member };
}

export async function requireOnboardingUser() {
  const session = await requireUser();
  const member = await getMemberOnboardingRecord(session.supabase, session.user.id);

  if (isMemberOnboardingComplete(member)) {
    redirect("/dashboard");
  }

  return { ...session, member };
}

export async function getMemberOnboardingRecord(
  supabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("members")
    .select(memberOnboardingSelect)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("ATLETIX member onboarding lookup failed", error);

    const { data: legacyData, error: legacyError } = await supabase
      .from("members")
      .select(legacyMemberOnboardingSelect)
      .eq("user_id", userId)
      .maybeSingle();

    if (legacyError) {
      console.error("ATLETIX legacy member onboarding lookup failed", legacyError);

      return null;
    }

    if (!legacyData) {
      return null;
    }

    return withProfileAvatar(supabase, userId, {
      ...(legacyData as Omit<MemberOnboardingRecord, "avatar_url" | "group_id">),
      group_id: null,
    });
  }

  if (!data) {
    return null;
  }

  return withProfileAvatar(
    supabase,
    userId,
    data as Omit<MemberOnboardingRecord, "avatar_url">,
  );
}

async function withProfileAvatar(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  member: Omit<MemberOnboardingRecord, "avatar_url">,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();

  return {
    ...member,
    avatar_url: profile?.avatar_url ?? null,
  };
}

export function isMemberOnboardingComplete(member: MemberOnboardingRecord | null) {
  return Boolean(
    member?.full_name &&
      member.email &&
      member.phone &&
      member.date_of_birth &&
      member.goal &&
      member.group_id &&
      member.height_cm !== null &&
      member.current_weight_kg !== null,
  );
}

async function getMemberDestination(
  supabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const member = await getMemberOnboardingRecord(supabase, userId);

  return isMemberOnboardingComplete(member) ? "/dashboard" : "/onboarding";
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const adminSession = getAdminSession(cookieStore);

  if (adminSession) {
    return {
      profile: { role: "admin" as const },
      supabase: null,
      user: {
        email: adminSession.username,
        id: "env-admin",
      },
    };
  }

  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    redirect("/admin/login?error=admin_required");
  }

  return { supabase, user, profile };
}
