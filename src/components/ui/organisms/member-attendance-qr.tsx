"use client";

import { useState } from "react";
import { QrCode, X } from "lucide-react";

export function MemberAttendanceQr({
  memberName,
  qrSvg,
}: {
  memberName: string;
  qrSvg: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
      >
        <QrCode size={18} />
        Mostrar QR
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#09090d] p-5 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff8bd8]">
                  QR asistencia
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">{memberName}</h2>
              </div>
              <button
                type="button"
                aria-label="Cerrar QR"
                onClick={() => setIsOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:border-[#ff2fa8]/50 hover:bg-[#ff2fa8]/10"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 rounded-3xl bg-white p-4">
              <div
                className="mx-auto aspect-square w-full overflow-hidden rounded-2xl"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            <p className="mt-4 text-center text-sm font-semibold text-zinc-400">
              Muestra este QR para registrar tu entrada.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
