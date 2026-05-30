import type { ReactNode } from "react";
import { Calendar, Clock3, Mail, Phone, Send, UserRound } from "lucide-react";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";
import type { TrainingGroup } from "@/lib/training-groups";

const fieldClass =
  "min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";

export function WaitlistForm({
  action,
  trainingGroups,
}: {
  action: (formData: FormData) => Promise<void> | void;
  trainingGroups: TrainingGroup[];
}) {
  return (
    <form action={action} className="grid gap-4">
      <FieldShell icon={<UserRound size={18} />} label="Nombre completo">
        <input
          className={fieldClass}
          name="fullName"
          placeholder="Tu nombre"
          required
          type="text"
        />
      </FieldShell>

      <FieldShell icon={<Mail size={18} />} label="Correo">
        <input
          autoComplete="email"
          className={fieldClass}
          name="email"
          placeholder="correo@ejemplo.com"
          required
          type="email"
        />
      </FieldShell>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell icon={<Phone size={18} />} label="Celular">
          <input
            autoComplete="tel"
            className={fieldClass}
            name="phone"
            placeholder="WhatsApp"
            required
            type="tel"
          />
        </FieldShell>

        <FieldShell icon={<Calendar size={18} />} label="Fecha de nacimiento">
          <input
            className={fieldClass}
            name="dateOfBirth"
            required
            type="date"
          />
        </FieldShell>
      </div>

      <FieldShell icon={<Clock3 size={18} />} label="Grupo preferido">
        <select
          className={`${fieldClass} appearance-none`}
          defaultValue=""
          name="preferredGroupId"
        >
          <option value="">Sin horario preferido</option>
          {trainingGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </FieldShell>

      <label className={labelClass}>
        Nota opcional
        <textarea
          className={`${fieldClass} mt-2 min-h-28 resize-none py-3 leading-6`}
          maxLength={500}
          name="notes"
          placeholder="Horario alterno, objetivo o detalle importante"
        />
      </label>

      <PendingSubmitButton
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]"
        pendingLabel="Enviando..."
      >
        <Send size={18} />
        Unirme a la lista
      </PendingSubmitButton>
    </form>
  );
}

function FieldShell({
  children,
  icon,
  label,
}: {
  children: ReactNode;
  icon: ReactNode;
  label: string;
}) {
  return (
    <label className={labelClass}>
      <span className="flex items-center gap-2">
        <span className="text-[#ff8bd8]">{icon}</span>
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
