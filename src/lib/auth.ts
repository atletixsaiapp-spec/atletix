import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { createClient } from "@/utils/supabase/server";

export async function requireUser() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return { supabase, user };
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
    redirect("/");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    redirect("/?error=admin_required");
  }

  return { supabase, user, profile };
}
