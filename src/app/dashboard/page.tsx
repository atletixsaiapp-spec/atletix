import { redirect } from "next/navigation";
import { MemberDashboard } from "@/components/ui/organisms/member-dashboard";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireOnboardedUser } from "@/lib/auth";
import { getMemberDashboardData } from "@/lib/member-dashboard";

export default async function DashboardPage() {
  const { member } = await requireOnboardedUser();

  if (!member) {
    redirect("/onboarding");
  }

  const dashboard = await getMemberDashboardData(member);

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="member" mode="member" />
      <MemberDashboard data={dashboard} />
    </main>
  );
}
