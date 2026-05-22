import { UserPlus } from "lucide-react";

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

export function CreateMemberAccountForm({
  action,
}: {
  action: (formData: FormData) => Promise<void> | void;
}) {
  return (
    <form action={action} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label className={labelClass}>
        Nombre completo
        <input
          className={fieldClass}
          name="fullName"
          placeholder="Nombre de la clienta"
          required
          type="text"
        />
      </label>

      <label className={labelClass}>
        Correo
        <input
          className={fieldClass}
          name="email"
          placeholder="correo@ejemplo.com"
          required
          type="email"
        />
      </label>

      <label className={labelClass}>
        Telefono
        <input
          className={fieldClass}
          name="phone"
          placeholder="WhatsApp"
          required
          type="tel"
        />
      </label>

      <label className={labelClass}>
        Objetivo
        <select className={fieldClass} defaultValue="" name="goal" required>
          <option disabled value="">
            Seleccionar
          </option>
          {goals.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Fecha de nacimiento
        <input className={fieldClass} name="dateOfBirth" type="date" />
      </label>

      <label className={labelClass}>
        Estatura
        <input
          className={fieldClass}
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
          min="0"
          name="initialWeightKg"
          placeholder="kg"
          step="0.1"
          type="number"
        />
      </label>

      <div className="flex items-end md:col-span-2 xl:col-span-1">
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]"
        >
          <UserPlus size={18} />
          Crear nueva cuenta
        </button>
      </div>
    </form>
  );
}
