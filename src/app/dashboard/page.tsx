import { redirect } from "next/navigation";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { MemberDashboard } from "@/components/ui/organisms/member-dashboard";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireOnboardedUser } from "@/lib/auth";
import { getMemberDashboardData } from "@/lib/member-dashboard";

const noticeCopy: Record<string, { body: string; tone: "success" | "warning" | "error" }> = {
  avatar_deleted: {
    body: "Tu foto de perfil fue eliminada.",
    tone: "success",
  },
  avatar_invalid_file: {
    body: "Sube una imagen JPG, PNG o WEBP de maximo 5 MB.",
    tone: "error",
  },
  avatar_profile_update_failed: {
    body: "No se pudo actualizar tu perfil con la foto.",
    tone: "warning",
  },
  avatar_upload_failed: {
    body: "No pudimos guardar la foto. Intentalo de nuevo.",
    tone: "error",
  },
  avatar_uploaded: {
    body: "Tu foto de perfil fue actualizada.",
    tone: "success",
  },
  missing_supabase_admin: {
    body: "Falta configuracion del servidor para actualizar tu foto.",
    tone: "error",
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { member } = await requireOnboardedUser();
  const { notice } = await searchParams;

  if (!member) {
    redirect("/onboarding");
  }

  const dashboard = await getMemberDashboardData(member);
  const noticeConfig = notice ? noticeCopy[notice] : null;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="member" mode="member" />
      {noticeConfig ? (
        <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <AdminNotice {...noticeConfig} />
        </section>
      ) : null}
      <MemberDashboard data={dashboard} />
    </main>
  );
}
