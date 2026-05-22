import { ClientLoginScreen } from "@/components/auth/login-screen";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return <ClientLoginScreen error={error} />;
}
