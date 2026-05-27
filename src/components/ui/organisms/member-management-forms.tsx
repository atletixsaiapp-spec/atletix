import type { AdminMemberDetail } from "@/lib/admin-member-detail";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";

const goals = [
  "Bajar grasa",
  "Ganar masa muscular",
  "Tonificar",
  "Fuerza",
  "Salud general",
];

const levels = ["Rookie", "Warrior", "Elite", "Titan", "Icon", "Legend"];

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";

type Action = (formData: FormData) => Promise<void> | void;

export function EditMemberProfileForm({
  action,
  detail,
}: {
  action: Action;
  detail: AdminMemberDetail;
}) {
  const member = detail.member;

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="memberId" type="hidden" value={member.id} />

      <label className={labelClass}>
        Nombre
        <input
          className={fieldClass}
          defaultValue={member.name}
          name="fullName"
          required
          type="text"
        />
      </label>

      <label className={labelClass}>
        Correo
        <input
          className={fieldClass}
          defaultValue={member.email}
          name="email"
          required
          type="email"
        />
      </label>

      <label className={labelClass}>
        Telefono
        <input
          className={fieldClass}
          defaultValue={member.phone}
          name="phone"
          required
          type="tel"
        />
      </label>

      <label className={labelClass}>
        Fecha nacimiento
        <input
          className={fieldClass}
          defaultValue={member.dateOfBirth ?? ""}
          name="dateOfBirth"
          type="date"
        />
      </label>

      <label className={labelClass}>
        Objetivo
        <select className={fieldClass} defaultValue={member.goal} name="goal" required>
          {goals.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Nivel
        <select className={fieldClass} defaultValue={member.level} name="level" required>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Estatura
        <input
          className={fieldClass}
          defaultValue={member.heightCm ?? ""}
          min="0"
          name="heightCm"
          placeholder="cm"
          type="number"
        />
      </label>

      <label className={labelClass}>
        Peso inicial
        <input
          className={fieldClass}
          defaultValue={member.initialWeightKg ?? ""}
          min="0"
          name="initialWeightKg"
          placeholder="kg"
          step="0.1"
          type="number"
        />
      </label>

      <label className={labelClass}>
        Peso actual
        <input
          className={fieldClass}
          defaultValue={member.currentWeightKg ?? ""}
          min="0"
          name="currentWeightKg"
          placeholder="kg"
          step="0.1"
          type="number"
        />
      </label>

      <label className={labelClass}>
        XP
        <input
          className={fieldClass}
          defaultValue={member.xp}
          min="0"
          name="xp"
          type="number"
        />
      </label>

      <label className={labelClass}>
        Racha
        <input
          className={fieldClass}
          defaultValue={member.streakDays}
          min="0"
          name="streakDays"
          type="number"
        />
      </label>

      <div className="flex items-end">
        <PendingSubmitButton
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
          pendingLabel="Guardando cambios..."
        >
          Guardar cambios
        </PendingSubmitButton>
      </div>
    </form>
  );
}

export function MembershipActionForms({
  activateAction,
  defaultEnd,
  defaultStart,
  memberId,
  revokeAction,
}: {
  activateAction: Action;
  defaultEnd: string;
  defaultStart: string;
  memberId: string;
  revokeAction: Action;
}) {
  return (
    <div className="grid gap-4">
      <form action={activateAction} className="grid gap-4 sm:grid-cols-2">
        <input name="memberId" type="hidden" value={memberId} />
        <label className={labelClass}>
          Inicio
          <input
            className={fieldClass}
            defaultValue={defaultStart}
            name="startDate"
            required
            type="date"
          />
        </label>
        <label className={labelClass}>
          Vence
          <input
            className={fieldClass}
            defaultValue={defaultEnd}
            name="endDate"
            required
            type="date"
          />
        </label>
        <PendingSubmitButton
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:bg-emerald-300 sm:col-span-2"
          pendingLabel="Activando membresía..."
        >
          Activar membresia
        </PendingSubmitButton>
      </form>

      <form action={revokeAction}>
        <input name="memberId" type="hidden" value={memberId} />
        <PendingSubmitButton
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-red-300/30 bg-red-400/10 px-5 py-3 text-sm font-black text-red-100 transition hover:bg-red-400/20"
          pendingLabel="Revocando membresía..."
        >
          Revocar membresia
        </PendingSubmitButton>
      </form>
    </div>
  );
}

export function ManualPaymentForm({
  action,
  defaultEnd,
  defaultPaidAt,
  defaultStart,
  memberId,
}: {
  action: Action;
  defaultEnd: string;
  defaultPaidAt: string;
  defaultStart: string;
  memberId: string;
}) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="memberId" type="hidden" value={memberId} />

      <label className={labelClass}>
        Valor COP
        <input
          className={fieldClass}
          min="1"
          name="amountCop"
          placeholder="150000"
          required
          type="number"
        />
      </label>

      <label className={labelClass}>
        Fecha pago
        <input
          className={fieldClass}
          defaultValue={defaultPaidAt}
          name="paidAt"
          required
          type="date"
        />
      </label>

      <label className={labelClass}>
        Periodo inicio
        <input
          className={fieldClass}
          defaultValue={defaultStart}
          name="periodStart"
          required
          type="date"
        />
      </label>

      <label className={labelClass}>
        Periodo vence
        <input
          className={fieldClass}
          defaultValue={defaultEnd}
          name="periodEnd"
          required
          type="date"
        />
      </label>

      <label className={labelClass}>
        Metodo
        <select className={fieldClass} defaultValue="transfer" name="method">
          <option value="transfer">Transferencia</option>
          <option value="cash">Efectivo</option>
          <option value="nequi">Nequi</option>
          <option value="daviplata">Daviplata</option>
          <option value="other">Otro</option>
        </select>
      </label>

      <label className={labelClass}>
        Fuente
        <select className={fieldClass} defaultValue="whatsapp" name="source">
          <option value="whatsapp">WhatsApp</option>
          <option value="front_desk">Recepcion</option>
          <option value="manual">Manual</option>
        </select>
      </label>

      <label className={`${labelClass} md:col-span-2`}>
        Nota
        <textarea
          className={`${fieldClass} min-h-24 py-3`}
          name="notes"
          placeholder="Confirmado por WhatsApp, referencia, observaciones..."
        />
      </label>

      <PendingSubmitButton
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] md:col-span-2"
        pendingLabel="Registrando pago..."
      >
        Registrar pago manual
      </PendingSubmitButton>
    </form>
  );
}
