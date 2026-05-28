import { redirect } from "next/navigation";
import { ClientLoginScreen } from "@/components/auth/login-screen";
import { getAuthenticatedMemberDestination } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const destination = await getAuthenticatedMemberDestination();

  if (destination && !error) {
    redirect(destination);
  }

  return <ClientLoginScreen error={error} />;
}
