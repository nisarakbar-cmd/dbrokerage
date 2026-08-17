"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import type { Listing, Photo } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/tier-badge";
import { AvailabilityDot, StatusPill } from "@/components/ui/status-pill";
import { WhatsAppIcon } from "@/components/ui/icons";
import { formatPriceRupees, formatSize } from "@/lib/format";
import { cn } from "@/lib/utils";

const AVAILABILITY_LABEL: Record<Exclude<Listing["availability"], "AVAILABLE">, string> = {
  UNDER_OFFER: "Under Offer",
  SOLD: "Sold",
  WITHDRAWN: "Withdrawn",
};

export interface PropertyCardListing
  extends Pick<
    Listing,
    | "slug"
    | "title"
    | "propertyType"
    | "tier"
    | "priceRupees"
    | "areaLabel"
    | "bedrooms"
    | "bathrooms"
    | "sizeValue"
    | "sizeUnit"
    | "availability"
  > {
  photos: Pick<Photo, "url" | "alt">[];
}

export interface PropertyCardProps {
  listing: PropertyCardListing;
  className?: string;
}

export function PropertyCard({ listing, className }: PropertyCardProps) {
  const photo = listing.photos[0];
  const isPlot = listing.propertyType === "PLOT";
  const href = `/property/${listing.slug}`;

  return (
    <article className={cn("overflow-hidden rounded-xl border border-border bg-bg-surface", className)}>
      <Link href={href} className="relative block aspect-[4/3] w-full bg-bg-elevated">
        {photo && (
          <Image
            src={photo.url}
            alt={photo.alt ?? listing.title}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        )}
        <TierBadge tier={listing.tier} className="absolute top-3 left-3" />
      </Link>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="text-xl font-semibold tabular-nums text-text hover:text-primary">
            {formatPriceRupees(listing.priceRupees)}
          </Link>
          {listing.availability === "AVAILABLE" ? (
            <AvailabilityDot />
          ) : (
            <StatusPill color="var(--text-subtle)" label={AVAILABILITY_LABEL[listing.availability]} />
          )}
        </div>

        <Link href={href} className="line-clamp-1 text-sm font-medium text-text hover:text-primary">
          {listing.title}
        </Link>

        <div className="flex items-center gap-1 text-sm text-text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{listing.areaLabel}</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-text-muted">
          {!isPlot && (
            <>
              <span>{listing.bedrooms} Beds</span>
              <span aria-hidden="true">·</span>
              <span>{listing.bathrooms} Baths</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{formatSize(listing.sizeValue, listing.sizeUnit)}</span>
        </div>

        <div className="mt-1 flex gap-2">
          <Button
            variant="viewing"
            size="sm"
            className="flex-1"
            onClick={() => {
              // TODO(M3): open LeadDialog (source=REQUEST_VIEWING, listingId=listing.slug)
            }}
          >
            <Calendar />
            Request a Viewing
          </Button>
          <Button
            variant="contact"
            size="sm"
            className="flex-1"
            onClick={() => {
              // TODO(M3): open LeadDialog (source=CONTACT_AGENT, listingId=listing.slug)
            }}
          >
            <WhatsAppIcon />
            Contact Agent
          </Button>
        </div>
      </div>
    </article>
  );
}
