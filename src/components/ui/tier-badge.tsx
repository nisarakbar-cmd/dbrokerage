import { ShieldCheck } from "lucide-react";
import type { ListingTier } from "@prisma/client";
import { cn } from "@/lib/utils";

// §12 tier integrity: unverified must never borrow verified styling/language.
const TIER_CONFIG: Record<
  ListingTier,
  { label: string; className: string; showShield: boolean }
> = {
  VERIFIED_FEATURED: {
    label: "Featured & Verified",
    className: "border-transparent bg-primary text-primary-foreground",
    showShield: true,
  },
  VERIFIED: {
    label: "Verified",
    className: "border-primary/30 bg-primary/10 text-primary",
    showShield: true,
  },
  UNVERIFIED: {
    label: "Unverified",
    className: "border-border bg-bg-elevated text-text-muted",
    showShield: false,
  },
};

export interface TierBadgeProps {
  tier: ListingTier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.showShield && <ShieldCheck className="size-3.5" />}
      {config.label}
    </span>
  );
}
