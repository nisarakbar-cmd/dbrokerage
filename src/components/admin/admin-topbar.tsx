"use client";

import { useState } from "react";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewLeadDialog } from "@/components/admin/new-lead-dialog";

export interface AdminTopbarProps {
  /** Follow-ups due — a real count, never fabricated. Omit/0 hides the badge. */
  notificationCount: number;
  agents: { id: string; name: string }[];
  listings: { id: string; title: string; areaLabel: string }[];
}

export function AdminTopbar({ notificationCount, agents, listings }: AdminTopbarProps) {
  const [newLeadOpen, setNewLeadOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-bg-surface px-6">
      <div className="relative w-full max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
        {/* Presentational for now — the Leads & Pipeline table has its own
            functional search; a global cross-entity search is a later polish item. */}
        <label className="sr-only" htmlFor="admin-topbar-search">
          Search leads, properties
        </label>
        <input
          id="admin-topbar-search"
          type="search"
          placeholder="Search leads, properties…"
          className="h-8 w-full rounded-lg border border-input bg-transparent py-1 pr-2.5 pl-8 text-sm outline-none placeholder:text-text-subtle focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={
            notificationCount > 0
              ? `Notifications: ${notificationCount} follow-up${notificationCount === 1 ? "" : "s"} due`
              : "Notifications"
          }
          className="relative inline-flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-elevated hover:text-text"
        >
          <Bell className="size-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>
        <Button variant="primary" size="sm" onClick={() => setNewLeadOpen(true)}>
          <Plus />
          New lead
        </Button>
      </div>

      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} agents={agents} listings={listings} />
    </header>
  );
}
