"use server";

import { revalidatePath } from "next/cache";
import type { Availability, ListingTier } from "@prisma/client";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/assert-admin";
import { listingFormSchema, type ListingFormValues } from "@/lib/listing-schema";
import { generateUniqueSlug } from "@/lib/admin-listings";
import {
  isChecklistComplete,
  verificationChecklistSchema,
  type VerificationChecklist,
} from "@/lib/verification-checklist";
import { formatPriceRupees } from "@/lib/format";

const RUPEES_PER_CRORE = 10_000_000;

const TIER_LABEL: Record<ListingTier, string> = {
  VERIFIED_FEATURED: "Featured & Verified",
  VERIFIED: "Verified",
  UNVERIFIED: "Unverified",
};

const AVAILABILITY_LABEL_FULL: Record<Availability, string> = {
  AVAILABLE: "Available",
  UNDER_OFFER: "Under Offer",
  SOLD: "Sold",
  WITHDRAWN: "Withdrawn",
};

// Next.js redacts thrown Error messages from Server Actions in production
// builds (the client only receives an opaque digest) — so expected,
// user-actionable failures (validation, gating rules) must be returned as
// a value, not thrown. Throwing is reserved for truly unexpected bugs,
// where a generic client-side fallback message is fine.
export type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

function revalidatePublic(slug?: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/buy");
  if (slug) revalidatePath(`/property/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/property/${previousSlug}`);
  revalidatePath("/admin/listings");
}

export async function createListing(
  input: ListingFormValues
): Promise<ActionResult<{ id: string; slug: string }>> {
  const admin = await assertAdmin();
  const parsed = listingFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const data = parsed.data;

  const slug = await generateUniqueSlug(data.slug || data.title);
  const priceRupees = BigInt(Math.round(data.priceCrore * RUPEES_PER_CRORE));
  const isPlot = data.propertyType === "PLOT";

  const listing = await db.listing.create({
    data: {
      slug,
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      tier: "UNVERIFIED",
      priceRupees,
      availability: "AVAILABLE",
      published: false,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      city: data.city,
      zone: data.zone,
      sector: data.sector,
      phase: data.phase,
      society: data.society,
      subSector: data.subSector,
      areaLabel: data.areaLabel,
      lat: data.lat,
      lng: data.lng,
      bedrooms: isPlot ? null : data.bedrooms,
      bathrooms: isPlot ? null : data.bathrooms,
      sizeValue: data.sizeValue,
      sizeUnit: data.sizeUnit,
      sourceRef: data.sourceRef,
      lastCheckedAt: data.lastCheckedAt ? new Date(data.lastCheckedAt) : null,
      photos: { create: data.photos.map((p, i) => ({ url: p.url, alt: p.alt, order: i })) },
    },
  });

  await db.listingAudit.create({
    data: { listingId: listing.id, type: "CREATED", message: `Listing created: ${listing.title}.`, actorId: admin.id },
  });

  revalidatePublic(slug);
  return { ok: true, id: listing.id, slug };
}

export async function updateListing(id: string, input: ListingFormValues): Promise<ActionResult<{ slug: string }>> {
  const admin = await assertAdmin();
  const parsed = listingFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const data = parsed.data;

  const existing = await db.listing.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Listing not found." };

  const slug = data.slug && data.slug !== existing.slug ? await generateUniqueSlug(data.slug, id) : existing.slug;
  const priceRupees = BigInt(Math.round(data.priceCrore * RUPEES_PER_CRORE));
  const isPlot = data.propertyType === "PLOT";
  const priceChanged = priceRupees !== existing.priceRupees;

  await db.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id },
      data: {
        slug,
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        priceRupees,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        city: data.city,
        zone: data.zone,
        sector: data.sector,
        phase: data.phase,
        society: data.society,
        subSector: data.subSector,
        areaLabel: data.areaLabel,
        lat: data.lat,
        lng: data.lng,
        bedrooms: isPlot ? null : data.bedrooms,
        bathrooms: isPlot ? null : data.bathrooms,
        sizeValue: data.sizeValue,
        sizeUnit: data.sizeUnit,
        sourceRef: data.sourceRef,
        lastCheckedAt: data.lastCheckedAt ? new Date(data.lastCheckedAt) : null,
      },
    });

    // Replace-all for photos — simplest correct approach for URL-only
    // management (no diffing individual rows against the submitted array).
    await tx.photo.deleteMany({ where: { listingId: id } });
    if (data.photos.length > 0) {
      await tx.photo.createMany({
        data: data.photos.map((p, i) => ({ listingId: id, url: p.url, alt: p.alt, order: i })),
      });
    }

    await tx.listingAudit.create({
      data: { listingId: id, type: "UPDATED", message: `Listing details updated: ${data.title}.`, actorId: admin.id },
    });
    if (priceChanged) {
      await tx.listingAudit.create({
        data: {
          listingId: id,
          type: "PRICE_CHANGED",
          message: `Price changed to ${formatPriceRupees(priceRupees)}.`,
          actorId: admin.id,
        },
      });
    }
  });

  revalidatePublic(slug, existing.slug);
  return { ok: true, slug };
}

export async function setListingTier(id: string, tier: ListingTier): Promise<ActionResult> {
  const admin = await assertAdmin();
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return { ok: false, error: "Listing not found." };

  // §12 tier integrity: trust is earned through the checklist, never just
  // assigned — server-validated against the DB's current state, not
  // whatever the client claims.
  if ((tier === "VERIFIED" || tier === "VERIFIED_FEATURED") && !listing.verificationChecklistDone) {
    return { ok: false, error: "Complete the verification checklist before setting this tier." };
  }

  await db.$transaction([
    db.listing.update({ where: { id }, data: { tier } }),
    db.listingAudit.create({
      data: { listingId: id, type: "TIER_CHANGED", message: `Tier changed to ${TIER_LABEL[tier]}.`, actorId: admin.id },
    }),
  ]);

  revalidatePublic(listing.slug);
  return { ok: true };
}

export async function setVerificationChecklist(
  id: string,
  checklist: VerificationChecklist
): Promise<ActionResult> {
  const admin = await assertAdmin();
  const parsedChecklist = verificationChecklistSchema.safeParse(checklist);
  if (!parsedChecklist.success) return { ok: false, error: "Invalid checklist data." };

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return { ok: false, error: "Listing not found." };

  const done = isChecklistComplete(parsedChecklist.data);
  const autoDowngrade = !done && listing.tier !== "UNVERIFIED";

  await db.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id },
      data: {
        verificationChecklist: parsedChecklist.data,
        verificationChecklistDone: done,
        // Unchecking an item clears the verified date/by, too — a stale
        // "verified since" date would misrepresent an incomplete checklist.
        verifiedDate: done ? (listing.verifiedDate ?? new Date()) : null,
        verifiedBy: done ? (admin.name ?? admin.email ?? "Admin") : null,
        ...(autoDowngrade ? { tier: "UNVERIFIED" } : {}),
      },
    });

    await tx.listingAudit.create({
      data: {
        listingId: id,
        type: "VERIFICATION_UPDATED",
        message: done ? "Verification checklist completed." : "Verification checklist updated (incomplete).",
        actorId: admin.id,
      },
    });

    if (autoDowngrade) {
      await tx.listingAudit.create({
        data: {
          listingId: id,
          type: "TIER_CHANGED",
          message: "Tier automatically reset to Unverified — the verification checklist is no longer complete.",
          actorId: admin.id,
        },
      });
    }
  });

  revalidatePublic(listing.slug);
  return { ok: true };
}

export async function publishListing(id: string): Promise<ActionResult> {
  const admin = await assertAdmin();
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return { ok: false, error: "Listing not found." };

  await db.$transaction([
    db.listing.update({ where: { id }, data: { published: true } }),
    db.listingAudit.create({ data: { listingId: id, type: "PUBLISHED", message: "Listing published.", actorId: admin.id } }),
  ]);

  revalidatePublic(listing.slug);
  return { ok: true };
}

export async function unpublishListing(id: string): Promise<ActionResult> {
  const admin = await assertAdmin();
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return { ok: false, error: "Listing not found." };

  await db.$transaction([
    db.listing.update({ where: { id }, data: { published: false } }),
    db.listingAudit.create({
      data: { listingId: id, type: "UNPUBLISHED", message: "Listing unpublished.", actorId: admin.id },
    }),
  ]);

  revalidatePublic(listing.slug);
  return { ok: true };
}

export async function setAvailability(id: string, availability: Availability): Promise<ActionResult> {
  const admin = await assertAdmin();
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return { ok: false, error: "Listing not found." };

  await db.$transaction([
    db.listing.update({ where: { id }, data: { availability } }),
    db.listingAudit.create({
      data: {
        listingId: id,
        type: "AVAILABILITY_CHANGED",
        message: `Availability changed to ${AVAILABILITY_LABEL_FULL[availability]}.`,
        actorId: admin.id,
      },
    }),
  ]);

  revalidatePublic(listing.slug);
  return { ok: true };
}

export async function archiveListing(id: string): Promise<ActionResult> {
  const admin = await assertAdmin();
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return { ok: false, error: "Listing not found." };

  await db.$transaction([
    db.listing.update({ where: { id }, data: { archivedAt: new Date(), published: false } }),
    db.listingAudit.create({ data: { listingId: id, type: "ARCHIVED", message: "Listing archived.", actorId: admin.id } }),
  ]);

  revalidatePublic(listing.slug);
  return { ok: true };
}

export async function restoreListing(id: string): Promise<ActionResult> {
  const admin = await assertAdmin();
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return { ok: false, error: "Listing not found." };

  await db.$transaction([
    db.listing.update({ where: { id }, data: { archivedAt: null } }),
    db.listingAudit.create({ data: { listingId: id, type: "RESTORED", message: "Listing restored.", actorId: admin.id } }),
  ]);

  revalidatePublic(listing.slug);
  return { ok: true };
}

/** Only for a listing with zero leads and zero viewings — otherwise a hard
 * delete would break those FKs and destroy history. Archive covers every
 * other case. */
export async function hardDeleteListing(id: string): Promise<ActionResult> {
  await assertAdmin();

  const listing = await db.listing.findUnique({
    where: { id },
    select: { slug: true, _count: { select: { leads: true, viewings: true } } },
  });
  if (!listing) return { ok: false, error: "Listing not found." };
  if (listing._count.leads > 0 || listing._count.viewings > 0) {
    return { ok: false, error: "This listing has leads or viewings attached — archive it instead of deleting." };
  }

  await db.listing.delete({ where: { id } }); // cascades Photo + ListingAudit
  revalidatePublic(undefined, listing.slug);
  return { ok: true };
}
