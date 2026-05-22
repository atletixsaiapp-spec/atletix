import { AdminLoginScreen } from "@/components/auth/login-screen";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return <AdminLoginScreen error={error} />;
}
