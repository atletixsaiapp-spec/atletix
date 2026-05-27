"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

export function PendingSubmitButton({
  children,
  className,
  pendingLabel,
}: {
  children: ReactNode;
  className: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" size={18} />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
