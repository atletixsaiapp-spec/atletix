"use client";

import { useId, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";

type HiddenField = {
  name: string;
  value: string;
};

type ConfirmationModalProps = {
  action: (formData: FormData) => Promise<void> | void;
  cancelLabel?: string;
  confirmLabel: string;
  confirmationLabel?: string;
  confirmationName?: string;
  confirmationPlaceholder?: string;
  confirmationValue?: string;
  description: string;
  hiddenFields?: HiddenField[];
  title: string;
  triggerLabel: string;
};

export function ConfirmationModal({
  action,
  cancelLabel = "Cancelar",
  confirmLabel,
  confirmationLabel,
  confirmationName = "confirmation",
  confirmationPlaceholder,
  confirmationValue,
  description,
  hiddenFields = [],
  title,
  triggerLabel,
}: ConfirmationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const titleId = useId();
  const descriptionId = useId();
  const needsConfirmation = Boolean(confirmationValue);
  const canSubmit = !needsConfirmation || confirmation === confirmationValue;

  return (
    <>
      <button
        className="min-h-12 w-full rounded-full border border-red-300/30 bg-red-400/10 px-5 py-3 text-sm font-black text-red-100 transition hover:bg-red-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/75 p-3 backdrop-blur-sm sm:place-items-center sm:p-6">
          <button
            aria-label="Cerrar modal"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setIsOpen(false)}
            type="button"
          />

          <section
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            aria-modal="true"
            className="relative w-full max-w-lg rounded-3xl border border-red-300/20 bg-[#09090d] p-5 shadow-2xl shadow-black/60 sm:p-6"
            role="dialog"
          >
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-400/10 text-red-200">
                <AlertTriangle size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black text-white" id={titleId}>
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400" id={descriptionId}>
                  {description}
                </p>
              </div>
            </div>

            <form action={action} className="mt-5 grid gap-4">
              {hiddenFields.map((field) => (
                <input
                  key={field.name}
                  name={field.name}
                  type="hidden"
                  value={field.value}
                />
              ))}

              {needsConfirmation ? (
                <label className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                  {confirmationLabel ?? "Confirmacion"}
                  <input
                    className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-red-300/60"
                    name={confirmationName}
                    onChange={(event) => setConfirmation(event.target.value)}
                    placeholder={confirmationPlaceholder}
                    type="text"
                    value={confirmation}
                  />
                </label>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className="min-h-12 rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  {cancelLabel}
                </button>
                <PendingSubmitButton
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-400 px-5 py-3 text-sm font-black text-black transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!canSubmit}
                  pendingLabel="Procesando..."
                >
                  {confirmLabel}
                </PendingSubmitButton>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
