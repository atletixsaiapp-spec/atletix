import { LoaderCircle } from "lucide-react";

export function LoadingSpinner({
  className = "",
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <LoaderCircle
      aria-hidden="true"
      className={`shrink-0 animate-spin ${className}`.trim()}
      size={size}
    />
  );
}
