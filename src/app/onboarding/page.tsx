import { completeOnboarding } from "@/app/onboarding/actions";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { OnboardingForm } from "@/components/ui/organisms/onboarding-form";
import { ProfileAvatarManager } from "@/components/ui/organisms/profile-avatar-manager";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireOnboardingUser } from "@/lib/auth";
import { getAvailableTrainingGroups } from "@/lib/training-groups";

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
  invalid_onboarding: {
    body: "Revisa los datos antes de continuar.",
    tone: "error",
  },
  member_update_failed: {
    body: "No se pudo actualizar tu ficha.",
    tone: "error",
  },
  missing_member: {
    body: "No encontramos una ficha asociada a tu acceso.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta configuración del servidor para completar el perfil.",
    tone: "error",
  },
  profile_update_failed: {
    body: "No se pudo actualizar tu perfil de acceso.",
    tone: "warning",
  },
  password_mismatch: {
    body: "Las contraseñas no coinciden.",
    tone: "error",
  },
  password_short: {
    body: "Tu contraseña debe tener al menos 8 caracteres.",
    tone: "error",
  },
  password_update_failed: {
    body: "No pudimos guardar tu contraseña. Abre de nuevo el enlace del correo.",
    tone: "error",
  },
  progress_update_failed: {
    body: "No se pudo guardar tu primera medición de progreso.",
    tone: "warning",
  },
  group_full: {
    body: "Ese grupo ya no tiene cupos disponibles. Elige otro horario.",
    tone: "error",
  },
  invalid_group: {
    body: "Selecciona un grupo con cupos disponibles.",
    tone: "error",
  },
  missing_groups: {
    body: "Aun no hay grupos disponibles. El equipo debe crear cupos antes de completar el perfil.",
    tone: "warning",
  },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; setup?: string }>;
}) {
  const [{ member }, { notice, setup }] = await Promise.all([
    requireOnboardingUser(),
    searchParams,
  ]);
  const groups = await getAvailableTrainingGroups();
  const noticeConfig = notice ? noticeCopy[notice] : null;
  const initials = getInitials(member?.full_name ?? "ATLETIX");

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="member" mode="member" />

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-3xl place-items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="glass-panel w-full rounded-3xl p-6 sm:p-8">
          {noticeConfig ? (
            <div className="mb-5">
              <AdminNotice {...noticeConfig} />
            </div>
          ) : null}

          <section className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <ProfileAvatarManager
              avatarUrl={member?.avatar_url ?? null}
              destination="onboarding"
              initials={initials}
            />
          </section>

          {groups.setupMessage ? (
            <div className="mb-5">
              <AdminNotice body={groups.setupMessage} tone="warning" />
            </div>
          ) : null}
          {!groups.setupMessage && !groups.groups.length ? (
            <div className="mb-5">
              <AdminNotice body={noticeCopy.missing_groups.body} tone="warning" />
            </div>
          ) : null}

          <OnboardingForm
            action={completeOnboarding}
            member={member}
            passwordSetup={setup === "1"}
            trainingGroups={groups.groups}
          />
        </div>
      </section>
    </main>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
