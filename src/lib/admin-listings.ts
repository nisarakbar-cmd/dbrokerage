import type { Availability, ListingTier, Prisma, PropertyType, SizeUnit, Zone } from "@prisma/client";
import { db } from "@/lib/db";
import { parseChecklist, type VerificationChecklist } from "@/lib/verification-checklist";

const PAGE_SIZE = 10;

export interface AdminListingsFilters {
  tier?: ListingTier;
  availability?: Availability;
  published?: boolean;
  propertyType?: PropertyType;
  search?: string;
  showArchived?: boolean;
  page?: number;
}

export interface AdminListingRow {
  id: string;
  slug: string;
  title: string;
  areaLabel: string;
  propertyType: PropertyType;
  priceRupees: number;
  tier: ListingTier;
  availability: Availability;
  published: boolean;
  verifiedDate: string | null;
  archivedAt: string | null;
}

export interface AdminListingsPage {
  listings: AdminListingRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAdminListingsPage(filters: AdminListingsFilters): Promise<AdminListingsPage> {
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.ListingWhereInput = {};
  if (!filters.showArchived) where.archivedAt = null;
  if (filters.tier) where.tier = filters.tier;
  if (filters.availability) where.availability = filters.availability;
  if (filters.published !== undefined) where.published = filters.published;
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { areaLabel: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    db.listing.count({ where }),
    db.listing.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    total,
    page,
    pageSize: PAGE_SIZE,
    listings: rows.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      areaLabel: l.areaLabel,
      propertyType: l.propertyType,
      priceRupees: Number(l.priceRupees),
      tier: l.tier,
      availability: l.availability,
      published: l.published,
      verifiedDate: l.verifiedDate?.toISOString() ?? null,
      archivedAt: l.archivedAt?.toISOString() ?? null,
    })),
  };
}

const PROPERTY_TYPE_SET = new Set(["HOUSE", "APARTMENT", "PLOT"]);
const TIER_SET = new Set(["VERIFIED_FEATURED", "VERIFIED", "UNVERIFIED"]);
const AVAILABILITY_SET = new Set(["AVAILABLE", "UNDER_OFFER", "SOLD", "WITHDRAWN"]);

export function parseAdminListingsFilters(
  searchParams: Record<string, string | string[] | undefined>
): AdminListingsFilters {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const tier = get("tier");
  const availability = get("availability");
  const type = get("type");
  const published = get("published");
  const page = get("page");

  return {
    tier: tier && TIER_SET.has(tier) ? (tier as ListingTier) : undefined,
    availability: availability && AVAILABILITY_SET.has(availability) ? (availability as Availability) : undefined,
    propertyType: type && PROPERTY_TYPE_SET.has(type) ? (type as PropertyType) : undefined,
    published: published === "true" ? true : published === "false" ? false : undefined,
    search: get("search") || undefined,
    showArchived: get("archived") === "true",
    page: page ? Math.max(1, parseInt(page, 10) || 1) : 1,
  };
}

export interface ListingEditData {
  id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  priceCrore: number;
  tier: ListingTier;
  city: string;
  zone: Zone;
  sector: string | null;
  phase: string | null;
  society: string | null;
  subSector: string | null;
  areaLabel: string;
  lat: number | null;
  lng: number | null;
  sizeValue: number;
  sizeUnit: SizeUnit;
  bedrooms: number | null;
  bathrooms: number | null;
  photos: { url: string; alt: string | null }[];
  expiryDate: string | null;
  sourceRef: string | null;
  lastCheckedAt: string | null;
  published: boolean;
  availability: Availability;
  verificationChecklist: VerificationChecklist;
  verificationChecklistDone: boolean;
  verifiedDate: string | null;
  verifiedBy: string | null;
  archivedAt: string | null;
  leadCount: number;
  viewingCount: number;
}

const RUPEES_PER_CRORE = 10_000_000;

export async function getListingForEdit(id: string): Promise<ListingEditData | null> {
  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { order: "asc" } },
      _count: { select: { leads: true, viewings: true } },
    },
  });
  if (!listing) return null;

  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    propertyType: listing.propertyType,
    priceCrore: Number(listing.priceRupees) / RUPEES_PER_CRORE,
    tier: listing.tier,
    city: listing.city,
    zone: listing.zone,
    sector: listing.sector,
    phase: listing.phase,
    society: listing.society,
    subSector: listing.subSector,
    areaLabel: listing.areaLabel,
    lat: listing.lat,
    lng: listing.lng,
    sizeValue: listing.sizeValue,
    sizeUnit: listing.sizeUnit,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    photos: listing.photos.map((p) => ({ url: p.url, alt: p.alt })),
    expiryDate: listing.expiryDate ? listing.expiryDate.toISOString().slice(0, 10) : null,
    sourceRef: listing.sourceRef,
    lastCheckedAt: listing.lastCheckedAt ? listing.lastCheckedAt.toISOString().slice(0, 10) : null,
    published: listing.published,
    availability: listing.availability,
    verificationChecklist: parseChecklist(listing.verificationChecklist),
    verificationChecklistDone: listing.verificationChecklistDone,
    verifiedDate: listing.verifiedDate?.toISOString() ?? null,
    verifiedBy: listing.verifiedBy,
    archivedAt: listing.archivedAt?.toISOString() ?? null,
    leadCount: listing._count.leads,
    viewingCount: listing._count.viewings,
  };
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "listing"
  );
}

/** Generates a URL slug from a title, appending a short numeric suffix on
 * collision. Pass `excludeId` when editing so a listing doesn't collide
 * with its own current slug. */
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await db.listing.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}
