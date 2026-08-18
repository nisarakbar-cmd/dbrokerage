"use client";

import { useState } from "react";
import { Calendar, MessageCircle } from "lucide-react";
import type { ListingTier } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { LeadDialog } from "@/components/public/lead-dialog";
import type { ListingContext } from "@/components/public/lead-capture/listing-context-card";

export interface ListingCtaProps {
  tier: ListingTier;
  listing: ListingContext;
}

export function ListingCta({ tier, listing }: ListingCtaProps) {
  const [dialogSource, setDialogSource] = useState<"REQUEST_VIEWING" | "CONTACT_AGENT" | null>(null);

  // §12 tier integrity: unverified listings never get the reserved
  // viewing/contact actions — those would imply a confirmed, verified deal.
  if (tier === "UNVERIFIED") {
    return (
      <>
        <Button variant="primary" className="w-full" onClick={() => setDialogSource("CONTACT_AGENT")}>
          <MessageCircle />
          Ask dBrokerage to verify / check availability
        </Button>
        {dialogSource && (
          <LeadDialog
            open
            onOpenChange={(next) => !next && setDialogSource(null)}
            source={dialogSource}
            listing={listing}
            title="Ask dBrokerage to verify"
            submitLabel="Send request"
            ctaVariant="primary"
            defaultMessage="Could you verify this listing and confirm current availability?"
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="viewing" className="flex-1" onClick={() => setDialogSource("REQUEST_VIEWING")}>
          <Calendar />
          Request a Viewing
        </Button>
        <Button variant="contact" className="flex-1" onClick={() => setDialogSource("CONTACT_AGENT")}>
          <WhatsAppIcon />
          Contact Agent
        </Button>
      </div>
      {dialogSource && (
        <LeadDialog
          key={dialogSource}
          open
          onOpenChange={(next) => !next && setDialogSource(null)}
          source={dialogSource}
          listing={listing}
        />
      )}
    </>
  );
}
