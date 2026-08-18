"use client";

import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// TODO(M4): "+ New lead" dialog (manual lead entry, phoneVerified=false) —
// stubbed per the brief's own build-order note; everything else in this
// milestone takes priority.
export function AdminTopbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-bg-surface px-6">
      <div className="relative w-full max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
        {/* Presentational for now — the Leads & Pipeline table has its own
            functional search; a global cross-entity search is a later polish item. */}
        <input
          type="search"
          placeholder="Search leads, properties…"
          className="h-8 w-full rounded-lg border border-input bg-transparent py-1 pr-2.5 pl-8 text-sm outline-none placeholder:text-text-subtle focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-elevated hover:text-text"
        >
          <Bell className="size-4" />
        </button>
        <Button variant="primary" size="sm" disabled title="Coming soon">
          <Plus />
          New lead
        </Button>
      </div>
    </header>
  );
}
