"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoadingSpinner } from "@/components/ui/atoms/loading-spinner";

export function PendingSubmitButton({
  children,
  className,
  disabled = false,
  pendingLabel,
}: {
  children: ReactNode;
  className: string;
  disabled?: boolean;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      aria-disabled={isDisabled}
      disabled={isDisabled}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {pending ? (
        <>
          <LoadingSpinner />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
