import { PIPELINE_COLUMNS, type PipelineCounts } from "@/lib/pipeline";

export function PipelineBoard({ counts }: { counts: PipelineCounts }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {PIPELINE_COLUMNS.map((col) => (
        <div key={col.key} className="flex flex-col gap-2 rounded-xl border border-border bg-bg-surface p-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: col.color }} />
            <span className="text-xs font-medium text-text-muted">{col.label}</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-text">{counts[col.key]}</p>
        </div>
      ))}
    </div>
  );
}
