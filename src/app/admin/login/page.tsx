import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginScreen } from "@/components/auth/login-screen";
import { getAdminSession } from "@/lib/admin-session";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const adminSession = getAdminSession(await cookies());

  if (adminSession && !error) {
    redirect("/admin");
  }

  return <AdminLoginScreen error={error} />;
}
