type AdminNoticeTone = "success" | "warning" | "error";

export function AdminNotice({
  body,
  tone,
}: {
  body: string;
  tone: AdminNoticeTone;
}) {
  const tones = {
    error: "border-red-300/20 bg-red-400/10 text-red-100",
    success: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    warning: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  };

  return (
    <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${tones[tone]}`}>
      {body}
    </div>
  );
}
