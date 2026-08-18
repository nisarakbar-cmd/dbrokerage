import { Construction } from "lucide-react";

export function ComingSoon({ title, milestone }: { title: string; milestone: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <Construction className="size-8 text-text-subtle" aria-hidden="true" />
      <h1 className="text-xl font-semibold text-text">{title}</h1>
      <p className="text-sm text-text-muted">Coming in {milestone}.</p>
    </div>
  );
}
