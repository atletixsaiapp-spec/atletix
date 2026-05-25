import { Upload } from "lucide-react";

const fieldClass =
  "mt-2 min-h-64 w-full rounded-3xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";

export function BulkMemberInviteForm({
  action,
}: {
  action: (formData: FormData) => Promise<void> | void;
}) {
  return (
    <form action={action} className="mt-5 grid gap-5">
      <label className={labelClass}>
        Datos pegados desde Excel o CSV
        <textarea
          className={fieldClass}
          name="bulkContacts"
          placeholder={`nombre Completo\tCorreo electronico\tEDAD\tFECHA DE CUMPLEANOS\tCELULAR
Maria Perez\tmaria@email.com\t29\t15/04/1997\t3001234567`}
          required
        />
      </label>

      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8] sm:w-fit"
      >
        <Upload size={18} />
        Importar y enviar invitaciones
      </button>
    </form>
  );
}
