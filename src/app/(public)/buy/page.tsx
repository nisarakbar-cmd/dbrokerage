import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Zone } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/public/filter-bar";
import { LocationBreadcrumb } from "@/components/public/location-breadcrumb";
import { SortSelect } from "@/components/public/sort-select";
import { ViewToggle } from "@/components/public/view-toggle";
import { PropertyCard } from "@/components/public/property-card";
import { getBuyPageListings, type BuySearchParams } from "@/lib/listings";
import { ZONE_LABEL } from "@/lib/location";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Properties for Sale in Islamabad & Rawalpindi | dBrokerage",
  description:
    "Browse checked and verified residential listings across Islamabad & Rawalpindi. Filter by type, price, bedrooms, size and location.",
};

interface BuyPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const VALID_ZONES = new Set(Object.keys(ZONE_LABEL));

export default async function BuyPage({ searchParams }: BuyPageProps) {
  const sp = await searchParams;
  const params: BuySearchParams = {
    type: firstParam(sp.type),
    price: firstParam(sp.price),
    bedrooms: firstParam(sp.bedrooms),
    size: firstParam(sp.size),
    zone: firstParam(sp.zone),
    city: firstParam(sp.city),
    sector: firstParam(sp.sector),
    phase: firstParam(sp.phase),
    society: firstParam(sp.society),
    sort: firstParam(sp.sort),
  };
  const view = firstParam(sp.view) === "list" ? "list" : "grid";

  const { listings, total } = await getBuyPageListings(params);
  const hasFilters = Object.values(params).some(Boolean);
  const validZone = params.zone && VALID_ZONES.has(params.zone) ? (params.zone as Zone) : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        {validZone && (
          <LocationBreadcrumb
            location={{
              city: params.city ?? "Islamabad",
              zone: validZone,
              sector: params.sector,
              phase: params.phase,
              society: params.society,
            }}
          />
        )}
        <h1 className="text-3xl font-semibold text-text sm:text-4xl">
          Properties for sale in Islamabad &amp; Rawalpindi
        </h1>
      </div>

      <FilterBar className="mb-6" />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text tabular-nums">
            {total} {total === 1 ? "property" : "properties"}
          </p>
          <p className="text-xs text-text-muted">
            All matching listings, ordered by listing priority — <TierLegend />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SortSelect className="w-full sm:w-auto" />
          <ViewToggle />
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div
          className={cn(
            "grid gap-5",
            view === "list" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        >
          {listings.map((listing) => (
            <PropertyCard key={listing.slug} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function TierLegend() {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1">
      <span className="inline-block size-1.5 rounded-full bg-primary" /> Featured &amp; Verified
      <ChevronRight className="inline size-3 text-text-subtle" aria-hidden="true" />
      <span className="inline-block size-1.5 rounded-full bg-primary/40" /> Verified
      <ChevronRight className="inline size-3 text-text-subtle" aria-hidden="true" />
      <span className="inline-block size-1.5 rounded-full bg-text-subtle" /> Unverified
    </span>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-bg-surface px-6 py-16 text-center">
      <p className="text-lg font-medium text-text">No properties match these filters yet</p>
      <p className="max-w-sm text-sm text-text-muted">
        Try widening your price range or size, or clear your filters to see all checked inventory.
      </p>
      {hasFilters && (
        <Button asChild variant="outline" size="sm">
          <Link href="/buy">Clear filters</Link>
        </Button>
      )}
    </div>
  );
}
