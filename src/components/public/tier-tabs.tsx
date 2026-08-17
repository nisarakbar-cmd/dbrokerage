"use client";

import type { ListingTier } from "@prisma/client";
import { cn } from "@/lib/utils";

const TABS: { tier: ListingTier; label: string; subtitle?: string }[] = [
  { tier: "VERIFIED_FEATURED", label: "Featured & Verified", subtitle: "Represented directly by dBrokerage" },
  { tier: "VERIFIED", label: "Verified" },
  { tier: "UNVERIFIED", label: "Unverified" },
];

export interface TierTabsProps {
  value: ListingTier;
  onChange: (tier: ListingTier) => void;
  className?: string;
}

export function TierTabs({ value, onChange, className }: TierTabsProps) {
  const active = TABS.find((t) => t.tier === value);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div role="tablist" aria-label="Listing tier" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = tab.tier === value;
          return (
            <button
              key={tab.tier}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.tier)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-transparent text-text-muted hover:text-text"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {active?.subtitle && <p className="text-sm text-text-muted">{active.subtitle}</p>}
    </div>
  );
}
