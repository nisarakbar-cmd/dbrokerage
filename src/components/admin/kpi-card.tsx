import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: number;
  delta: number | null;
}

export function KpiCard({ label, value, delta }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-bg-surface p-4">
      <p className="text-xs font-medium tracking-wide text-text-muted uppercase">{label}</p>
      <p className="text-3xl font-semibold tabular-nums text-text">{value}</p>
      {delta !== null && (
        <p
          className={cn(
            "flex items-center gap-1 text-xs font-medium tabular-nums",
            delta > 0 && "text-success",
            delta < 0 && "text-destructive",
            delta === 0 && "text-text-muted"
          )}
        >
          {delta > 0 && <ArrowUp className="size-3" />}
          {delta < 0 && <ArrowDown className="size-3" />}
          {delta === 0 && <Minus className="size-3" />}
          {delta > 0 ? `+${delta}` : delta} vs yesterday
        </p>
      )}
    </div>
  );
}
