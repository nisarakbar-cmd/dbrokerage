"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ViewToggleProps {
  className?: string;
}

function ViewToggleInner({ className }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "list" ? "list" : "grid";

  function setView(next: "grid" | "list") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "grid") params.delete("view");
    else params.set("view", next);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-lg border border-border p-0.5", className)}>
      <ToggleButton active={view === "grid"} label="Grid" onClick={() => setView("grid")}>
        <LayoutGrid className="size-4" />
      </ToggleButton>
      <ToggleButton active={view === "list"} label="List" onClick={() => setView("list")}>
        <List className="size-4" />
      </ToggleButton>
      <button
        type="button"
        disabled
        aria-label="Map view — coming soon"
        title="Map view — coming soon"
        className="flex cursor-not-allowed items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-text-subtle opacity-50"
      >
        <Map className="size-4" />
      </button>
    </div>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none",
        active ? "bg-primary text-primary-foreground" : "text-text-muted hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

export function ViewToggle(props: ViewToggleProps) {
  return (
    <Suspense fallback={<div className="h-8 w-28 rounded-lg border border-border" />}>
      <ViewToggleInner {...props} />
    </Suspense>
  );
}
