import { CheckCircle2 } from "lucide-react";
import type { MemberOnboardingRecord } from "@/lib/auth";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";

const goals = [
  "Bajar grasa",
  "Ganar masa muscular",
  "Tonificar",
  "Fuerza",
  "Salud general",
];

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";

export function OnboardingForm({
  action,
  member,
}: {
  action: (formData: FormData) => Promise<void> | void;
  member: MemberOnboardingRecord | null;
}) {
  return (
    <form action={action} className="mt-6 grid gap-4 md:grid-cols-2">
      <label className={labelClass}>
        Nombre completo
        <input
          className={fieldClass}
          defaultValue={member?.full_name ?? ""}
          name="fullName"
          required
          type="text"
        />
      </label>

      <label className={labelClass}>
        Telefono
        <input
          className={fieldClass}
          defaultValue={member?.phone ?? ""}
          name="phone"
          required
          type="tel"
        />
      </label>

      <label className={labelClass}>
        Fecha de nacimiento
        <input
          className={fieldClass}
          defaultValue={member?.date_of_birth ?? ""}
          name="dateOfBirth"
          required
          type="date"
        />
      </label>

      <label className={labelClass}>
        Genero
        <select className={fieldClass} defaultValue="" name="gender">
          <option value="">Seleccionar</option>
          <option value="woman">Mujer</option>
          <option value="man">Hombre</option>
          <option value="non_binary">No binario</option>
          <option value="other">Otro</option>
          <option value="prefer_not">Prefiero no decirlo</option>
        </select>
      </label>

      <label className={labelClass}>
        Objetivo
        <select
          className={fieldClass}
          defaultValue={member?.goal ?? "Salud general"}
          name="goal"
          required
        >
          {goals.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Estatura
        <input
          className={fieldClass}
          defaultValue={member?.height_cm ?? ""}
          min="1"
          name="heightCm"
          placeholder="cm"
          required
          type="number"
        />
      </label>

      <label className={labelClass}>
        Peso inicial
        <input
          className={fieldClass}
          defaultValue={member?.initial_weight_kg ?? ""}
          min="1"
          name="initialWeightKg"
          placeholder="kg"
          required
          step="0.1"
          type="number"
        />
      </label>

      <label className={labelClass}>
        Peso actual
        <input
          className={fieldClass}
          defaultValue={member?.current_weight_kg ?? ""}
          min="1"
          name="currentWeightKg"
          placeholder="kg"
          required
          step="0.1"
          type="number"
        />
      </label>

      <div className="flex items-end md:col-span-2">
        <PendingSubmitButton
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]"
          pendingLabel="Guardando perfil..."
        >
          <CheckCircle2 size={18} />
          Finalizar onboarding
        </PendingSubmitButton>
      </div>
    </form>
  );
}
