import { ClipboardCheck } from "lucide-react";
import { completeOnboarding } from "@/app/onboarding/actions";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { OnboardingForm } from "@/components/ui/organisms/onboarding-form";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireOnboardingUser } from "@/lib/auth";

const noticeCopy: Record<string, { body: string; tone: "success" | "warning" | "error" }> = {
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
    body: "Falta configuracion del servidor para completar el onboarding.",
    tone: "error",
  },
  profile_update_failed: {
    body: "No se pudo actualizar tu perfil de acceso.",
    tone: "warning",
  },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const [{ member }, { notice }] = await Promise.all([
    requireOnboardingUser(),
    searchParams,
  ]);
  const noticeConfig = notice ? noticeCopy[notice] : null;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="member" />

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-3xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-panel w-full rounded-3xl p-6 sm:p-8">
          <div className="grid size-14 place-items-center rounded-3xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
            <ClipboardCheck size={28} />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            Completar perfil
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-white">
            Ultimo paso para activar tu panel
          </h1>
          <p className="mt-4 leading-7 text-zinc-400">
            Confirma tus datos iniciales para personalizar tu rutina, membresia y
            progreso dentro de ATLETIX.
          </p>

          {noticeConfig ? (
            <div className="mt-5">
              <AdminNotice {...noticeConfig} />
            </div>
          ) : null}

          <OnboardingForm action={completeOnboarding} member={member} />
        </div>
      </section>
    </main>
  );
}
