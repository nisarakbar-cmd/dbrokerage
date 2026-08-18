import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import type { ListingTier } from "@prisma/client";
import { TierBadge } from "@/components/ui/tier-badge";
import { AvailabilityDot, StatusPill } from "@/components/ui/status-pill";
import { LocationBreadcrumb } from "@/components/public/location-breadcrumb";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { ListingCta } from "@/components/public/listing-cta";
import { getListingBySlug } from "@/lib/listings";
import { AVAILABILITY_LABEL, formatDate, formatPriceRupees, formatSize, sizeToSqft } from "@/lib/format";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};

  const price = formatPriceRupees(listing.priceRupees);
  const title = `${listing.title} — ${price} | dBrokerage`;
  const specs = listing.propertyType === "PLOT"
    ? formatSize(listing.sizeValue, listing.sizeUnit)
    : `${listing.bedrooms} Beds · ${listing.bathrooms} Baths · ${formatSize(listing.sizeValue, listing.sizeUnit)}`;
  const description = `${listing.areaLabel} · ${specs} · ${price}`;
  const photo = listing.photos[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      // Key omitted entirely when there's no photo — Next falls back to
      // the branded opengraph-image.tsx default for this route.
      ...(photo ? { images: [{ url: photo.url, alt: photo.alt ?? listing.title }] } : {}),
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const isPlot = listing.propertyType === "PLOT";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    datePosted: listing.createdAt.toISOString(),
    ...(listing.photos[0] ? { image: listing.photos[0].url } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city,
      addressCountry: "PK",
    },
    ...(isPlot
      ? {}
      : {
          numberOfBedroomsTotal: listing.bedrooms ?? undefined,
          numberOfBathroomsTotal: listing.bathrooms ?? undefined,
        }),
    floorSize: {
      "@type": "QuantitativeValue",
      value: Math.round(sizeToSqft(listing.sizeValue, listing.sizeUnit)),
      unitText: "sqft",
    },
    offers: {
      "@type": "Offer",
      price: Number(listing.priceRupees),
      priceCurrency: "PKR",
      availability:
        listing.availability === "AVAILABLE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PhotoGallery
        photos={listing.photos.map((p) => ({ url: p.url, alt: p.alt }))}
        fallbackAlt={listing.title}
        className="mb-6"
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <TierBadge tier={listing.tier} />
              {listing.availability === "AVAILABLE" ? (
                <AvailabilityDot />
              ) : (
                <StatusPill color="var(--text-subtle)" label={AVAILABILITY_LABEL[listing.availability]} />
              )}
            </div>
            <h1 className="text-3xl font-semibold text-text sm:text-4xl">{listing.title}</h1>
            <div className="mt-2 flex items-center gap-1 text-sm text-text-muted">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {listing.areaLabel}
            </div>
            <LocationBreadcrumb location={listing} className="mt-2" />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-bg-surface p-4 text-sm text-text-muted">
            {!isPlot && (
              <>
                <span>{listing.bedrooms} Beds</span>
                <span>{listing.bathrooms} Baths</span>
              </>
            )}
            <span>{formatSize(listing.sizeValue, listing.sizeUnit)}</span>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-text">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
              {listing.description}
            </p>
          </div>

          <VerificationNote
            tier={listing.tier}
            verifiedDate={listing.verifiedDate}
            lastCheckedAt={listing.lastCheckedAt}
          />
        </div>

        <aside className="flex flex-col gap-4 self-start rounded-xl border border-border bg-bg-surface p-5 lg:sticky lg:top-20">
          <p className="text-2xl font-semibold tabular-nums text-text">
            {formatPriceRupees(listing.priceRupees)}
          </p>
          <ListingCta
            tier={listing.tier}
            listing={{
              id: listing.id,
              title: listing.title,
              areaLabel: listing.areaLabel,
              price: formatPriceRupees(listing.priceRupees),
            }}
          />
        </aside>
      </div>
    </div>
  );
}

function VerificationNote({
  tier,
  verifiedDate,
  lastCheckedAt,
}: {
  tier: ListingTier;
  verifiedDate: Date | null;
  lastCheckedAt: Date | null;
}) {
  if (tier === "UNVERIFIED") {
    return (
      <div className="rounded-xl border border-border bg-bg-elevated p-4 text-sm text-text-muted">
        <p className="font-medium text-text">Unverified listing</p>
        <p className="mt-1">
          This listing hasn&apos;t been checked by dBrokerage yet.
          {lastCheckedAt ? ` Last checked ${formatDate(lastCheckedAt)}.` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-4 text-sm text-text-muted">
      <p className="font-medium text-text">Verified by dBrokerage</p>
      {verifiedDate && <p className="mt-1">Verified {formatDate(verifiedDate)}.</p>}
    </div>
  );
}
