"use client";

import { useState } from "react";
import type { ListingTier } from "@prisma/client";
import { TierTabs } from "@/components/public/tier-tabs";
import { PropertyCard, type PropertyCardListing } from "@/components/public/property-card";

export interface ExplorePropertiesProps {
  listingsByTier: Record<ListingTier, PropertyCardListing[]>;
}

// All three tiers are fetched server-side once — switching tabs here only
// swaps which slice is shown, no refetch.
export function ExploreProperties({ listingsByTier }: ExplorePropertiesProps) {
  const [tier, setTier] = useState<ListingTier>("VERIFIED_FEATURED");
  const listings = listingsByTier[tier];

  return (
    <div className="flex flex-col gap-5">
      <TierTabs value={tier} onChange={setTier} />
      {listings.length === 0 ? (
        <p className="text-sm text-text-muted">No listings in this tier yet.</p>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {listings.map((listing) => (
            <PropertyCard
              key={listing.slug}
              listing={listing}
              className="w-72 shrink-0 snap-start sm:w-80"
            />
          ))}
        </div>
      )}
    </div>
  );
}
