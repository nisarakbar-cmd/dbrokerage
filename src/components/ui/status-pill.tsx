import { cn } from "@/lib/utils";

export interface StatusPillProps {
  /** Any valid CSS color — pass a design token, e.g. "var(--pipeline-new)". */
  color: string;
  label: string;
  className?: string;
}

/** Generic color + label pill — reused for lead/pipeline stages in M4. */
export function StatusPill({ color, label, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs font-medium text-text",
        className
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export interface AvailabilityDotProps {
  label?: string;
  className?: string;
}

export function AvailabilityDot({ label = "Available", className }: AvailabilityDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-text-muted", className)}>
      <span className="size-1.5 shrink-0 rounded-full bg-success" />
      {label}
    </span>
  );
}
