import { Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/tier-badge";
import { AvailabilityDot, StatusPill } from "@/components/ui/status-pill";
import { WhatsAppIcon } from "@/components/ui/icons";
import { PropertyCard, type PropertyCardListing } from "@/components/public/property-card";
import { FilterBar } from "@/components/public/filter-bar";
import { LocationBreadcrumb } from "@/components/public/location-breadcrumb";
import { TrustStrip } from "@/components/public/trust-strip";

// Dev aid — a living reference of every M1 component and variant.
// Remove or gate behind an env check before launch.

const PIPELINE_STAGES = [
  { label: "New", color: "var(--pipeline-new)" },
  { label: "Contacted", color: "var(--pipeline-contacted)" },
  { label: "Qualified", color: "var(--pipeline-qualified)" },
  { label: "Viewing Requested", color: "var(--pipeline-viewing)" },
  { label: "Negotiation", color: "var(--pipeline-negotiation)" },
  { label: "Closed", color: "var(--pipeline-closed)" },
  { label: "Lost", color: "var(--pipeline-lost)" },
];

const SAMPLE_LISTINGS: PropertyCardListing[] = [
  {
    slug: "dha-phase-2-house-8-75cr",
    title: "5-Bedroom House in DHA Phase 2",
    propertyType: "HOUSE",
    tier: "VERIFIED_FEATURED",
    priceRupees: 87_500_000,
    areaLabel: "DHA Phase 2, Islamabad",
    bedrooms: 5,
    bathrooms: 6,
    sizeValue: 1,
    sizeUnit: "KANAL",
    availability: "AVAILABLE",
    photos: [{ url: "https://picsum.photos/seed/dha-phase-2-house-8-75cr/1200/800", alt: null }],
  },
  {
    slug: "f-11-1-apartment-4-20cr",
    title: "3-Bedroom Apartment in F-11/1",
    propertyType: "APARTMENT",
    tier: "VERIFIED",
    priceRupees: 42_000_000,
    areaLabel: "F-11/1, Islamabad",
    bedrooms: 3,
    bathrooms: 3,
    sizeValue: 12,
    sizeUnit: "MARLA",
    availability: "UNDER_OFFER",
    photos: [{ url: "https://picsum.photos/seed/f-11-1-apartment-4-20cr/1200/800", alt: null }],
  },
  {
    slug: "bahria-town-phase-7-plot-2-85cr",
    title: "10 Marla Residential Plot in Bahria Town Phase 7",
    propertyType: "PLOT",
    tier: "UNVERIFIED",
    priceRupees: 28_500_000,
    areaLabel: "Bahria Town Phase 7, Rawalpindi",
    bedrooms: null,
    bathrooms: null,
    sizeValue: 10,
    sizeUnit: "MARLA",
    availability: "AVAILABLE",
    photos: [{ url: "https://picsum.photos/seed/bahria-town-phase-7-plot-2-85cr/1200/800", alt: null }],
  },
  {
    slug: "e-11-4-house-6-10cr",
    title: "4-Bedroom House in E-11/4",
    propertyType: "HOUSE",
    tier: "VERIFIED_FEATURED",
    priceRupees: 61_000_000,
    areaLabel: "E-11/4, Islamabad",
    bedrooms: 4,
    bathrooms: 5,
    sizeValue: 14,
    sizeUnit: "MARLA",
    availability: "SOLD",
    photos: [{ url: "https://picsum.photos/seed/e-11-4-house-6-10cr/1200/800", alt: null }],
  },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-border py-10">
      <div>
        <h2 className="text-2xl font-semibold text-text">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
          Internal — dev aid
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-text">Design system</h1>
        <p className="mt-2 max-w-2xl text-base text-text-muted">
          Every M1 component and variant, rendered with sample data. Static and
          presentational — buttons here are no-ops. Remove or gate this route
          before launch.
        </p>
      </div>

      <Section
        title="Buttons"
        description="primary (cyan), viewing (violet, calendar icon), contact (WhatsApp green), outline (cyan border), ghost. Verbs carry through the flow."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">
            <Search />
            Search
          </Button>
          <Button variant="viewing">
            <Calendar />
            Request a Viewing
          </Button>
          <Button variant="contact">
            <WhatsAppIcon />
            Contact Agent
          </Button>
          <Button variant="outline">Sign Up</Button>
          <Button variant="ghost">More filters</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="Tier badges" description="Unverified never borrows verified styling or language (§12).">
        <div className="flex flex-wrap items-center gap-3">
          <TierBadge tier="VERIFIED_FEATURED" />
          <TierBadge tier="VERIFIED" />
          <TierBadge tier="UNVERIFIED" />
        </div>
      </Section>

      <Section
        title="Status pills & availability"
        description="StatusPill is generic (color + label) — reused for pipeline stages in M4. AvailabilityDot is the green 'Available' indicator."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {PIPELINE_STAGES.map((stage) => (
              <StatusPill key={stage.label} color={stage.color} label={stage.label} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <AvailabilityDot />
            <AvailabilityDot label="Under Offer" />
          </div>
        </div>
      </Section>

      <Section
        title="Property card"
        description="Prop-driven off the Prisma Listing shape. Beds/baths hide for plots; non-available listings fall back to a status pill."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_LISTINGS.map((listing) => (
            <PropertyCard key={listing.slug} listing={listing} />
          ))}
        </div>
      </Section>

      <Section
        title="Filter bar & location breadcrumb"
        description="Presentational only — wired to URL params + server-side query in M2."
      >
        <div className="flex flex-col gap-4">
          <LocationBreadcrumb
            location={{ city: "Islamabad", zone: "DHA", phase: "Phase 2", sector: "Street 5" }}
          />
          <FilterBar />
        </div>
      </Section>

      <Section title="Trust strip">
        <div className="overflow-hidden rounded-xl border border-border">
          <TrustStrip />
        </div>
      </Section>

      <Section
        title="Top nav & footer"
        description="Rendered globally on every public page (see the header above and footer below). Resize the viewport to see the mobile hamburger drawer."
      >
        <p className="text-sm text-text-muted">No separate preview needed — this page uses them.</p>
      </Section>
    </div>
  );
}
