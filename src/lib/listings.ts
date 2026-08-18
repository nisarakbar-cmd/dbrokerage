import { Prisma } from "@prisma/client";
import type { Listing, ListingTier, Photo, PropertyType, Zone } from "@prisma/client";
import { db } from "@/lib/db";
import { sizeToSqft } from "@/lib/format";
import { isPriceBucket, isSizeBucket, PRICE_BUCKETS, SIZE_BUCKETS } from "@/lib/filters";
import type { PropertyCardListing } from "@/components/public/property-card";

const PROPERTY_TYPES: readonly PropertyType[] = ["HOUSE", "APARTMENT", "PLOT"];
const ZONES: readonly Zone[] = ["CDA", "DHA", "BAHRIA_TOWN", "BAHRIA_ENCLAVE", "PRIVATE_SCHEME"];
const SORTS = ["priority", "price-asc", "price-desc"] as const;
export type BuySort = (typeof SORTS)[number];

export interface BuySearchParams {
  type?: string;
  price?: string;
  bedrooms?: string;
  size?: string;
  zone?: string;
  city?: string;
  sector?: string;
  phase?: string;
  society?: string;
  sort?: string;
}

type ListingWithPhotos = Listing & { photos: Photo[] };

/** Converts a Prisma Listing into PropertyCard's props shape — priceRupees
 * (BigInt) becomes a Number here, before this data ever crosses into a
 * Client Component. */
export function toPropertyCardListing(listing: ListingWithPhotos): PropertyCardListing {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    propertyType: listing.propertyType,
    tier: listing.tier,
    priceRupees: Number(listing.priceRupees),
    areaLabel: listing.areaLabel,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sizeValue: listing.sizeValue,
    sizeUnit: listing.sizeUnit,
    availability: listing.availability,
    photos: listing.photos.map((p) => ({ url: p.url, alt: p.alt })),
  };
}

function parseNumberParam(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** Base visibility rule for every public listing query — never show
 * unpublished, archived, or withdrawn inventory. */
const PUBLIC_WHERE: Prisma.ListingWhereInput = {
  published: true,
  archivedAt: null,
  availability: { not: "WITHDRAWN" },
};

export async function getBuyPageListings(params: BuySearchParams) {
  const where: Prisma.ListingWhereInput = { ...PUBLIC_WHERE };

  if (params.type && PROPERTY_TYPES.includes(params.type as PropertyType)) {
    where.propertyType = params.type as PropertyType;
  }
  if (params.zone && ZONES.includes(params.zone as Zone)) {
    where.zone = params.zone as Zone;
  }
  if (params.city) where.city = params.city;
  if (params.sector) where.sector = params.sector;
  if (params.phase) where.phase = params.phase;
  if (params.society) where.society = params.society;

  const bedrooms = parseNumberParam(params.bedrooms);
  if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms };

  if (params.price && isPriceBucket(params.price)) {
    const { priceMin, priceMax } = PRICE_BUCKETS[params.price];
    where.priceRupees = {
      ...(priceMin !== undefined ? { gte: BigInt(Math.round(priceMin)) } : {}),
      ...(priceMax !== undefined ? { lte: BigInt(Math.round(priceMax)) } : {}),
    };
  }

  const sort: BuySort = (SORTS as readonly string[]).includes(params.sort ?? "")
    ? (params.sort as BuySort)
    : "priority";

  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sort === "price-asc"
      ? [{ priceRupees: "asc" }]
      : sort === "price-desc"
        ? [{ priceRupees: "desc" }]
        : // Postgres sorts enums by declared order: VERIFIED_FEATURED, VERIFIED,
          // UNVERIFIED — exactly the listing-priority order.
          [{ tier: "asc" }, { createdAt: "desc" }];

  const listings = await db.listing.findMany({
    where,
    orderBy,
    include: { photos: { orderBy: { order: "asc" } } },
  });

  const sizeBucket = params.size && isSizeBucket(params.size) ? SIZE_BUCKETS[params.size] : undefined;
  const withinSize = (listing: ListingWithPhotos) => {
    if (!sizeBucket) return true;
    const sqft = sizeToSqft(listing.sizeValue, listing.sizeUnit);
    if (sizeBucket.sizeMin !== undefined && sqft < sizeBucket.sizeMin) return false;
    if (sizeBucket.sizeMax !== undefined && sqft > sizeBucket.sizeMax) return false;
    return true;
  };

  const filtered = listings.filter(withinSize);

  return {
    listings: filtered.map(toPropertyCardListing),
    total: filtered.length,
    sort,
  };
}

/** Homepage "Explore properties" — top ~8 per tier, fetched once so the
 * TierTabs can switch client-side with no refetch. */
export async function getExploreSectionListings(perTier = 8) {
  const listings = await db.listing.findMany({
    where: PUBLIC_WHERE,
    orderBy: [{ tier: "asc" }, { createdAt: "desc" }],
    include: { photos: { orderBy: { order: "asc" } } },
  });

  const byTier: Record<ListingTier, PropertyCardListing[]> = {
    VERIFIED_FEATURED: [],
    VERIFIED: [],
    UNVERIFIED: [],
  };

  for (const listing of listings) {
    if (byTier[listing.tier].length < perTier) {
      byTier[listing.tier].push(toPropertyCardListing(listing));
    }
  }

  return byTier;
}

export function getListingBySlug(slug: string) {
  return db.listing.findFirst({
    where: { slug, ...PUBLIC_WHERE },
    include: { photos: { orderBy: { order: "asc" } } },
  });
}
