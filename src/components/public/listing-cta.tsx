"use client";

import { Calendar, MessageCircle } from "lucide-react";
import type { ListingTier } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";

export interface ListingCtaProps {
  tier: ListingTier;
  slug: string;
}

export function ListingCta({ tier, slug }: ListingCtaProps) {
  // §12 tier integrity: unverified listings never get the reserved
  // viewing/contact actions — those would imply a confirmed, verified deal.
  if (tier === "UNVERIFIED") {
    return (
      <Button
        variant="primary"
        className="w-full"
        data-listing-slug={slug}
        onClick={() => {
          // TODO(M3): open LeadDialog (source=CONTACT_AGENT, listingId=slug, message prefilled as a verification/availability request)
        }}
      >
        <MessageCircle />
        Ask dBrokerage to verify / check availability
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        variant="viewing"
        className="flex-1"
        data-listing-slug={slug}
        onClick={() => {
          // TODO(M3): open LeadDialog (source=REQUEST_VIEWING, listingId=slug)
        }}
      >
        <Calendar />
        Request a Viewing
      </Button>
      <Button
        variant="contact"
        className="flex-1"
        data-listing-slug={slug}
        onClick={() => {
          // TODO(M3): open LeadDialog (source=CONTACT_AGENT, listingId=slug)
        }}
      >
        <WhatsAppIcon />
        Contact Agent
      </Button>
    </div>
  );
}
