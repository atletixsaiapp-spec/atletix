import crypto from "node:crypto";
import { hasEmailConfig, sendWelcomeEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient } from "@/utils/supabase/admin";

const defaultInviteGoal = "Salud general";

export type InviteMemberInput = {
  dateOfBirth: string | null;
  email: string;
  fullName: string;
  groupId?: string | null;
  phone: string;
};

export type InviteMemberResult =
  | { emailSent: boolean; memberId: string; status: "created" }
  | {
      emailSent: false;
      memberId: string;
      status: "email_failed" | "link_failed";
    }
  | {
      emailSent: false;
      status: "auth_failed" | "duplicate" | "profile_failed" | "record_failed";
    };

export async function inviteMember(
  supabase: ReturnType<typeof createAdminClient>,
  input: InviteMemberInput,
): Promise<InviteMemberResult> {
  const { data: existingMember, error: existingMemberError } = await supabase
    .from("members")
    .select("id")
    .eq("email", input.email)
    .maybeSingle();

  if (existingMemberError) {
    return { emailSent: false, status: "record_failed" };
  }

  if (existingMember) {
    return { emailSent: false, status: "duplicate" };
  }

  const temporaryPassword = crypto.randomBytes(24).toString("base64url");
  const siteUrl = getSiteUrl();
  const loginUrl = `${siteUrl}/login`;
  const { data: createdUser, error: createUserError } =
    await supabase.auth.admin.createUser({
      email: input.email,
      email_confirm: true,
      password: temporaryPassword,
      user_metadata: {
        full_name: input.fullName,
        phone: input.phone,
      },
    });

  if (createUserError || !createdUser.user) {
    return { emailSent: false, status: "auth_failed" };
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await supabase.from("profiles").upsert({
    email: input.email,
    full_name: input.fullName,
    id: userId,
    phone: input.phone,
    role: "member",
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return { emailSent: false, status: "profile_failed" };
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      current_weight_kg: null,
      date_of_birth: input.dateOfBirth,
      email: input.email,
      full_name: input.fullName,
      goal: defaultInviteGoal,
      group_id: input.groupId ?? null,
      height_cm: null,
      initial_weight_kg: null,
      is_active: false,
      phone: input.phone,
      user_id: userId,
    })
    .select("id")
    .single();

  if (memberError || !member) {
    await supabase.auth.admin.deleteUser(userId);
    return { emailSent: false, status: "record_failed" };
  }

  if (!hasEmailConfig()) {
    return { emailSent: false, memberId: member.id, status: "created" };
  }

  const { data: recoveryLink, error: recoveryLinkError } =
    await supabase.auth.admin.generateLink({
      email: input.email,
      type: "recovery",
    });

  if (recoveryLinkError || !recoveryLink.properties?.hashed_token) {
    return { emailSent: false, memberId: member.id, status: "link_failed" };
  }

  const activationUrl = new URL("/auth/confirm", siteUrl);
  activationUrl.searchParams.set(
    "token_hash",
    recoveryLink.properties.hashed_token,
  );
  activationUrl.searchParams.set("type", "recovery");
  activationUrl.searchParams.set("next", "/onboarding?setup=1");

  try {
    await sendWelcomeEmail({
      actionUrl: activationUrl.toString(),
      email: input.email,
      fullName: input.fullName,
      loginUrl,
    });
  } catch (error) {
    console.error("ATLETIX invite email failed", error);
    return { emailSent: false, memberId: member.id, status: "email_failed" };
  }

  return { emailSent: true, memberId: member.id, status: "created" };
}
