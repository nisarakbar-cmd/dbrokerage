import { PrismaClient, type ListingTier, type PropertyType, type SizeUnit, type Zone, type Availability } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

interface SeedListing {
  slug: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  tier: ListingTier;
  priceRupees: bigint;
  availability?: Availability;
  city?: string;
  zone: Zone;
  sector?: string;
  phase?: string;
  society?: string;
  subSector?: string;
  areaLabel: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeValue: number;
  sizeUnit: SizeUnit;
  verifiedBy?: string;
  verifiedDaysAgo?: number;
  sourceRef?: string;
  lastCheckedDaysAgo?: number;
}

const LISTINGS: SeedListing[] = [
  // --- VERIFIED_FEATURED (8) ---
  {
    slug: "dha-phase-2-house-8-75cr",
    title: "5-Bedroom House in DHA Phase 2",
    description:
      "A spacious 1 kanal house in DHA Phase 2 with 5 bedrooms, 6 bathrooms and a modern layout, represented directly by dBrokerage.",
    propertyType: "HOUSE",
    tier: "VERIFIED_FEATURED",
    priceRupees: 87_500_000n,
    availability: "UNDER_OFFER",
    zone: "DHA",
    phase: "Phase 2",
    sector: "Street 5",
    areaLabel: "DHA Phase 2, Islamabad",
    bedrooms: 5,
    bathrooms: 6,
    sizeValue: 1,
    sizeUnit: "KANAL",
    verifiedBy: "Ahmed Raza",
    verifiedDaysAgo: 12,
  },
  {
    slug: "f-11-1-apartment-4-20cr",
    title: "3-Bedroom Apartment in F-11/1",
    description:
      "A well-maintained 3-bedroom apartment in F-11/1, checked and represented directly by dBrokerage.",
    propertyType: "APARTMENT",
    tier: "VERIFIED_FEATURED",
    priceRupees: 42_000_000n,
    zone: "CDA",
    sector: "F-11",
    subSector: "F-11/1",
    areaLabel: "F-11/1, Islamabad",
    bedrooms: 3,
    bathrooms: 3,
    sizeValue: 12,
    sizeUnit: "MARLA",
    verifiedBy: "Sana Iqbal",
    verifiedDaysAgo: 8,
  },
  {
    slug: "bahria-town-phase-7-plot-2-85cr",
    title: "10 Marla Residential Plot in Bahria Town Phase 7",
    description:
      "A corner residential plot in Bahria Town Phase 7, verified and represented directly by dBrokerage.",
    propertyType: "PLOT",
    tier: "VERIFIED_FEATURED",
    priceRupees: 28_500_000n,
    city: "Rawalpindi",
    zone: "BAHRIA_TOWN",
    phase: "Phase 7",
    sector: "Sector D",
    areaLabel: "Bahria Town Phase 7, Rawalpindi",
    sizeValue: 10,
    sizeUnit: "MARLA",
    verifiedBy: "Ahmed Raza",
    verifiedDaysAgo: 20,
  },
  {
    slug: "e-11-4-house-6-10cr",
    title: "4-Bedroom House in E-11/4",
    description:
      "A 14 marla house in E-11/4 with 4 bedrooms and 5 bathrooms, represented directly by dBrokerage.",
    propertyType: "HOUSE",
    tier: "VERIFIED_FEATURED",
    priceRupees: 61_000_000n,
    zone: "CDA",
    sector: "E-11",
    subSector: "E-11/4",
    areaLabel: "E-11/4, Islamabad",
    bedrooms: 4,
    bathrooms: 5,
    sizeValue: 14,
    sizeUnit: "MARLA",
    verifiedBy: "Sana Iqbal",
    verifiedDaysAgo: 5,
  },
  {
    slug: "dha-phase-1-house-7-50cr",
    title: "5-Bedroom House in DHA Phase 1",
    description:
      "A 1 kanal house in DHA Phase 1, Sector A, represented directly by dBrokerage.",
    propertyType: "HOUSE",
    tier: "VERIFIED_FEATURED",
    priceRupees: 75_000_000n,
    zone: "DHA",
    phase: "Phase 1",
    sector: "Sector A",
    areaLabel: "DHA Phase 1, Islamabad",
    bedrooms: 5,
    bathrooms: 5,
    sizeValue: 1,
    sizeUnit: "KANAL",
    verifiedBy: "Ahmed Raza",
    verifiedDaysAgo: 30,
  },
  {
    slug: "g-10-2-apartment-3-60cr",
    title: "3-Bedroom Apartment in G-10/2",
    description:
      "A 10 marla apartment in G-10/2, represented directly by dBrokerage.",
    propertyType: "APARTMENT",
    tier: "VERIFIED_FEATURED",
    priceRupees: 36_000_000n,
    zone: "CDA",
    sector: "G-10",
    subSector: "G-10/2",
    areaLabel: "G-10/2, Islamabad",
    bedrooms: 3,
    bathrooms: 3,
    sizeValue: 10,
    sizeUnit: "MARLA",
    verifiedBy: "Sana Iqbal",
    verifiedDaysAgo: 3,
  },
  {
    slug: "bahria-enclave-sector-e-house-5-90cr",
    title: "4-Bedroom House in Bahria Enclave Sector E",
    description:
      "A 12 marla house in Bahria Enclave Sector E, represented directly by dBrokerage.",
    propertyType: "HOUSE",
    tier: "VERIFIED_FEATURED",
    priceRupees: 59_000_000n,
    zone: "BAHRIA_ENCLAVE",
    phase: "Sector E",
    areaLabel: "Bahria Enclave Sector E, Islamabad",
    bedrooms: 4,
    bathrooms: 4,
    sizeValue: 12,
    sizeUnit: "MARLA",
    verifiedBy: "Ahmed Raza",
    verifiedDaysAgo: 15,
  },
  {
    slug: "dha-phase-2-apartment-3-95cr",
    title: "3-Bedroom Apartment in DHA Phase 2",
    description:
      "A 10 marla apartment in DHA Phase 2, Executive Block, represented directly by dBrokerage.",
    propertyType: "APARTMENT",
    tier: "VERIFIED_FEATURED",
    priceRupees: 39_500_000n,
    zone: "DHA",
    phase: "Phase 2",
    sector: "Executive Block",
    areaLabel: "DHA Phase 2, Islamabad",
    bedrooms: 3,
    bathrooms: 3,
    sizeValue: 10,
    sizeUnit: "MARLA",
    verifiedBy: "Sana Iqbal",
    verifiedDaysAgo: 18,
  },

  // --- VERIFIED (8) ---
  {
    slug: "f-10-3-house-5-20cr",
    title: "4-Bedroom House in F-10/3",
    description:
      "A 12 marla house in F-10/3, checked by dBrokerage but listed/represented elsewhere.",
    propertyType: "HOUSE",
    tier: "VERIFIED",
    priceRupees: 52_000_000n,
    zone: "CDA",
    sector: "F-10",
    subSector: "F-10/3",
    areaLabel: "F-10/3, Islamabad",
    bedrooms: 4,
    bathrooms: 4,
    sizeValue: 12,
    sizeUnit: "MARLA",
    verifiedBy: "Ahmed Raza",
    verifiedDaysAgo: 25,
  },
  {
    slug: "g-11-1-apartment-2-80cr",
    title: "2-Bedroom Apartment in G-11/1",
    description:
      "An 8 marla apartment in G-11/1, checked by dBrokerage but listed/represented elsewhere.",
    propertyType: "APARTMENT",
    tier: "VERIFIED",
    priceRupees: 28_000_000n,
    zone: "CDA",
    sector: "G-11",
    subSector: "G-11/1",
    areaLabel: "G-11/1, Islamabad",
    bedrooms: 2,
    bathrooms: 2,
    sizeValue: 8,
    sizeUnit: "MARLA",
    verifiedBy: "Sana Iqbal",
    verifiedDaysAgo: 10,
  },
  {
    slug: "bahria-town-phase-4-plot-1-95cr",
    title: "8 Marla Residential Plot in Bahria Town Phase 4",
    description:
      "A residential plot in Bahria Town Phase 4, checked by dBrokerage but listed/represented elsewhere.",
    propertyType: "PLOT",
    tier: "VERIFIED",
    priceRupees: 19_500_000n,
    city: "Rawalpindi",
    zone: "BAHRIA_TOWN",
    phase: "Phase 4",
    sector: "Sector C",
    areaLabel: "Bahria Town Phase 4, Rawalpindi",
    sizeValue: 8,
    sizeUnit: "MARLA",
    verifiedBy: "Ahmed Raza",
    verifiedDaysAgo: 7,
  },
  {
    slug: "dha-phase-3-house-6-75cr",
    title: "5-Bedroom House in DHA Phase 3",
    description:
      "A 1 kanal house in DHA Phase 3, checked by dBrokerage but listed/represented elsewhere.",
    propertyType: "HOUSE",
    tier: "VERIFIED",
    priceRupees: 67_500_000n,
    city: "Rawalpindi",
    zone: "DHA",
    phase: "Phase 3",
    sector: "Sector B",
    areaLabel: "DHA Phase 3, Rawalpindi",
    bedrooms: 5,
    bathrooms: 5,
    sizeValue: 1,
    sizeUnit: "KANAL",
    verifiedBy: "Sana Iqbal",
    verifiedDaysAgo: 22,
  },
  {
    slug: "i-8-3-house-4-40cr",
    title: "4-Bedroom House in I-8/3",
    description:
      "A 10 marla house in I-8/3, checked by dBrokerage but listed/represented elsewhere.",
    propertyType: "HOUSE",
    tier: "VERIFIED",
    priceRupees: 44_000_000n,
    zone: "CDA",
    sector: "I-8",
    subSector: "I-8/3",
    areaLabel: "I-8/3, Islamabad",
    bedrooms: 4,
    bathrooms: 4,
    sizeValue: 10,
    sizeUnit: "MARLA",
    verifiedBy: "Ahmed Raza",
    verifiedDaysAgo: 14,
  },
  {
    slug: "bahria-enclave-sector-f-apartment-3-10cr",
    title: "3-Bedroom Apartment in Bahria Enclave Sector F",
    description:
      "A 9 marla apartment in Bahria Enclave Sector F, checked by dBrokerage but listed/represented elsewhere.",
    propertyType: "APARTMENT",
    tier: "VERIFIED",
    priceRupees: 31_000_000n,
    zone: "BAHRIA_ENCLAVE",
    phase: "Sector F",
    areaLabel: "Bahria Enclave Sector F, Islamabad",
    bedrooms: 3,
    bathrooms: 3,
    sizeValue: 9,
    sizeUnit: "MARLA",
    verifiedBy: "Sana Iqbal",
    verifiedDaysAgo: 6,
  },
  {
    slug: "e-7-house-9-20cr",
    title: "5-Bedroom House in E-7",
    description:
      "A 2 kanal house in E-7, checked by dBrokerage but listed/represented elsewhere.",
    propertyType: "HOUSE",
    tier: "VERIFIED",
    priceRupees: 92_000_000n,
    zone: "CDA",
    sector: "E-7",
    areaLabel: "E-7, Islamabad",
    bedrooms: 5,
    bathrooms: 6,
    sizeValue: 2,
    sizeUnit: "KANAL",
    verifiedBy: "Ahmed Raza",
    verifiedDaysAgo: 28,
  },
  {
    slug: "g-13-plot-1-60cr",
    title: "7 Marla Residential Plot in G-13",
    description:
      "A residential plot in G-13, checked by dBrokerage but listed/represented elsewhere.",
    propertyType: "PLOT",
    tier: "VERIFIED",
    priceRupees: 16_000_000n,
    zone: "CDA",
    sector: "G-13",
    areaLabel: "G-13, Islamabad",
    sizeValue: 7,
    sizeUnit: "MARLA",
    verifiedBy: "Sana Iqbal",
    verifiedDaysAgo: 4,
  },

  // --- UNVERIFIED (8) ---
  {
    slug: "f-7-house-8-00cr",
    title: "4-Bedroom House in F-7",
    description: "A 1 kanal house in F-7. Unverified — not yet checked by dBrokerage.",
    propertyType: "HOUSE",
    tier: "UNVERIFIED",
    priceRupees: 80_000_000n,
    zone: "CDA",
    sector: "F-7",
    areaLabel: "F-7, Islamabad",
    bedrooms: 4,
    bathrooms: 5,
    sizeValue: 1,
    sizeUnit: "KANAL",
    sourceRef: "OLX listing — agent contact pending",
    lastCheckedDaysAgo: 2,
  },
  {
    slug: "bahria-town-phase-8-apartment-2-50cr",
    title: "3-Bedroom Apartment in Bahria Town Phase 8",
    description:
      "A 9 marla apartment in Bahria Town Phase 8. Unverified — not yet checked by dBrokerage.",
    propertyType: "APARTMENT",
    tier: "UNVERIFIED",
    priceRupees: 25_000_000n,
    city: "Rawalpindi",
    zone: "BAHRIA_TOWN",
    phase: "Phase 8",
    areaLabel: "Bahria Town Phase 8, Rawalpindi",
    bedrooms: 3,
    bathrooms: 2,
    sizeValue: 9,
    sizeUnit: "MARLA",
    sourceRef: "Zameen.com listing",
    lastCheckedDaysAgo: 5,
  },
  {
    slug: "g-9-plot-1-20cr",
    title: "6 Marla Residential Plot in G-9",
    description: "A residential plot in G-9. Unverified — not yet checked by dBrokerage.",
    propertyType: "PLOT",
    tier: "UNVERIFIED",
    priceRupees: 12_000_000n,
    zone: "CDA",
    sector: "G-9",
    areaLabel: "G-9, Islamabad",
    sizeValue: 6,
    sizeUnit: "MARLA",
    sourceRef: "Referred by walk-in client",
    lastCheckedDaysAgo: 9,
  },
  {
    slug: "dha-phase-5-house-5-50cr",
    title: "4-Bedroom House in DHA Phase 5",
    description: "A 12 marla house in DHA Phase 5. Unverified — not yet checked by dBrokerage.",
    propertyType: "HOUSE",
    tier: "UNVERIFIED",
    priceRupees: 55_000_000n,
    city: "Rawalpindi",
    zone: "DHA",
    phase: "Phase 5",
    areaLabel: "DHA Phase 5, Rawalpindi",
    bedrooms: 4,
    bathrooms: 4,
    sizeValue: 12,
    sizeUnit: "MARLA",
    sourceRef: "Facebook Marketplace",
    lastCheckedDaysAgo: 1,
  },
  {
    slug: "i-10-3-apartment-2-10cr",
    title: "2-Bedroom Apartment in I-10/3",
    description: "A 7 marla apartment in I-10/3. Unverified — not yet checked by dBrokerage.",
    propertyType: "APARTMENT",
    tier: "UNVERIFIED",
    priceRupees: 21_000_000n,
    zone: "CDA",
    sector: "I-10",
    subSector: "I-10/3",
    areaLabel: "I-10/3, Islamabad",
    bedrooms: 2,
    bathrooms: 2,
    sizeValue: 7,
    sizeUnit: "MARLA",
    sourceRef: "Local agent tip",
    lastCheckedDaysAgo: 11,
  },
  {
    slug: "bahria-enclave-sector-c-plot-1-40cr",
    title: "8 Marla Residential Plot in Bahria Enclave Sector C",
    description:
      "A residential plot in Bahria Enclave Sector C. Unverified — not yet checked by dBrokerage.",
    propertyType: "PLOT",
    tier: "UNVERIFIED",
    priceRupees: 14_000_000n,
    zone: "BAHRIA_ENCLAVE",
    phase: "Sector C",
    areaLabel: "Bahria Enclave Sector C, Islamabad",
    sizeValue: 8,
    sizeUnit: "MARLA",
    sourceRef: "Owner direct — unconfirmed",
    lastCheckedDaysAgo: 6,
  },
  {
    slug: "f-8-house-7-30cr",
    title: "4-Bedroom House in F-8",
    description: "A 14 marla house in F-8. Unverified — not yet checked by dBrokerage.",
    propertyType: "HOUSE",
    tier: "UNVERIFIED",
    priceRupees: 73_000_000n,
    zone: "CDA",
    sector: "F-8",
    areaLabel: "F-8, Islamabad",
    bedrooms: 4,
    bathrooms: 4,
    sizeValue: 14,
    sizeUnit: "MARLA",
    sourceRef: "Sourced via classifieds",
    lastCheckedDaysAgo: 3,
  },
  {
    slug: "bahria-town-phase-3-house-4-80cr",
    title: "3-Bedroom House in Bahria Town Phase 3",
    description:
      "A 10 marla house in Bahria Town Phase 3. Unverified — not yet checked by dBrokerage.",
    propertyType: "HOUSE",
    tier: "UNVERIFIED",
    priceRupees: 48_000_000n,
    city: "Rawalpindi",
    zone: "BAHRIA_TOWN",
    phase: "Phase 3",
    areaLabel: "Bahria Town Phase 3, Rawalpindi",
    bedrooms: 3,
    bathrooms: 4,
    sizeValue: 10,
    sizeUnit: "MARLA",
    sourceRef: "Third-party listing site",
    lastCheckedDaysAgo: 8,
  },
];

async function main() {
  console.log("Seeding agents...");
  const ahmed = await prisma.agent.upsert({
    where: { id: "agent-ahmed-raza" },
    update: {},
    create: {
      id: "agent-ahmed-raza",
      name: "Ahmed Raza",
      initials: "AR",
      email: "ahmed.raza@dbrokerage.pk",
    },
  });
  const sana = await prisma.agent.upsert({
    where: { id: "agent-sana-iqbal" },
    update: {},
    create: {
      id: "agent-sana-iqbal",
      name: "Sana Iqbal",
      initials: "SI",
      email: "sana.iqbal@dbrokerage.pk",
    },
  });

  console.log("Seeding admin user...");
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  await prisma.adminUser.upsert({
    where: { email: "hira.malik@dbrokerage.pk" },
    update: {},
    create: {
      name: "Hira Malik",
      email: "hira.malik@dbrokerage.pk",
      passwordHash: await argon2.hash(adminPassword),
      role: "ADMIN",
    },
  });

  console.log(`Seeding ${LISTINGS.length} listings...`);
  const listingIdBySlug = new Map<string, string>();
  for (const l of LISTINGS) {
    const verified = l.tier !== "UNVERIFIED";
    const listing = await prisma.listing.upsert({
      where: { slug: l.slug },
      update: {},
      create: {
        slug: l.slug,
        title: l.title,
        description: l.description,
        propertyType: l.propertyType,
        tier: l.tier,
        priceRupees: l.priceRupees,
        availability: l.availability ?? "AVAILABLE",
        published: true,
        city: l.city ?? "Islamabad",
        zone: l.zone,
        sector: l.sector,
        phase: l.phase,
        society: l.society,
        subSector: l.subSector,
        areaLabel: l.areaLabel,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        sizeValue: l.sizeValue,
        sizeUnit: l.sizeUnit,
        verificationChecklistDone: verified,
        verifiedDate: verified && l.verifiedDaysAgo != null ? daysAgo(l.verifiedDaysAgo) : null,
        verifiedBy: verified ? l.verifiedBy : null,
        sourceRef: verified ? null : l.sourceRef,
        lastCheckedAt: !verified && l.lastCheckedDaysAgo != null ? daysAgo(l.lastCheckedDaysAgo) : null,
        photos: {
          create: [
            {
              url: `https://picsum.photos/seed/${l.slug}/1200/800`,
              alt: l.title,
              order: 0,
            },
          ],
        },
      },
    });
    listingIdBySlug.set(l.slug, listing.id);
  }

  console.log("Seeding leads...");

  // Deterministic ids + upsert (matching the agent/admin pattern above) so
  // `npm run seed` stays safe to re-run — this used to `create()` unconditionally
  // and double up every lead (incl. Sara Khan) on a second seed pass.
  const sara = await prisma.lead.upsert({
    where: { id: "lead-sara-khan" },
    update: {},
    create: {
      id: "lead-sara-khan",
      source: "REQUEST_VIEWING",
      status: "VIEWING_REQUESTED",
      name: "Sara Khan",
      phone: "+923001234567",
      phoneVerified: true,
      verifiedAt: daysAgo(2),
      message: "Interested in scheduling a viewing this weekend.",
      preferredTime: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 4);
        return d;
      })(),
      listingId: listingIdBySlug.get("dha-phase-2-house-8-75cr"),
      assignedAgentId: ahmed.id,
      createdAt: daysAgo(2),
      lastActivityAt: daysAgo(1),
    },
  });

  await prisma.leadActivity.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "activity-sara-1",
        leadId: sara.id,
        type: "PHONE_VERIFIED",
        message: "Phone number verified via OTP.",
        createdAt: daysAgo(2),
      },
      {
        id: "activity-sara-2",
        leadId: sara.id,
        type: "VIEWING_REQUESTED",
        message: "Requested a viewing for DHA Phase 2 · PKR 8.75 Crore.",
        createdAt: daysAgo(2),
      },
      {
        id: "activity-sara-3",
        leadId: sara.id,
        type: "ASSIGNED",
        message: "Assigned to Ahmed Raza.",
        createdAt: daysAgo(1),
      },
    ],
  });

  await prisma.leadNote.upsert({
    where: { id: "note-sara-1" },
    update: {},
    create: {
      id: "note-sara-1",
      leadId: sara.id,
      body: "Prefers an evening visit. Financing pre-approved.",
    },
  });

  await prisma.lead.upsert({
    where: { id: "lead-hamza-ali" },
    update: {},
    create: {
      id: "lead-hamza-ali",
      source: "CONTACT_AGENT",
      status: "NEW",
      name: "Hamza Ali",
      phone: "+923012345678",
      phoneVerified: true,
      verifiedAt: daysAgo(1),
      message: "Please share more details about this apartment.",
      listingId: listingIdBySlug.get("f-11-1-apartment-4-20cr"),
      createdAt: daysAgo(1),
      lastActivityAt: daysAgo(1),
    },
  });

  await prisma.lead.upsert({
    where: { id: "lead-mariam-ahmed" },
    update: {},
    create: {
      id: "lead-mariam-ahmed",
      source: "SELL",
      status: "CONTACTED",
      name: "Mariam Ahmed",
      phone: "+923023456789",
      phoneVerified: true,
      verifiedAt: daysAgo(6),
      propertyInterest: "E-11/4, Islamabad",
      message: "Looking to sell my house in E-11/4.",
      assignedAgentId: ahmed.id,
      createdAt: daysAgo(6),
      lastActivityAt: daysAgo(5),
    },
  });

  await prisma.lead.upsert({
    where: { id: "lead-usman-tariq" },
    update: {},
    create: {
      id: "lead-usman-tariq",
      source: "HOME_ESTIMATOR",
      status: "QUALIFIED",
      name: "Usman Tariq",
      phone: "+923034567890",
      phoneVerified: true,
      verifiedAt: daysAgo(4),
      propertyInterest: "Bahria Town Phase 7",
      message: "Requesting an estimate for my plot.",
      createdAt: daysAgo(4),
      lastActivityAt: daysAgo(3),
    },
  });

  await prisma.lead.upsert({
    where: { id: "lead-noor-shah" },
    update: {},
    create: {
      id: "lead-noor-shah",
      source: "MARKET_UPDATES",
      status: "NEW",
      name: "Noor Shah",
      phone: "+923045678901",
      phoneVerified: true,
      verifiedAt: daysAgo(1),
      propertyInterest: "Islamabad residential",
      assignedAgentId: sana.id,
      createdAt: daysAgo(1),
      lastActivityAt: daysAgo(1),
    },
  });

  // A few extra demo leads (clearly seed data) so every pipeline column and
  // filter combination has something to show — Negotiation / Closed / Lost
  // aren't otherwise covered by the 5 canonical leads above, and none of
  // them exercise VIEWING_SCHEDULED (an already-scheduled viewing).
  const bilal = await prisma.lead.upsert({
    where: { id: "lead-bilal-sheikh" },
    update: {},
    create: {
      id: "lead-bilal-sheikh",
      source: "REQUEST_VIEWING",
      status: "NEGOTIATION",
      name: "Bilal Sheikh",
      phone: "+923056789012",
      phoneVerified: true,
      verifiedAt: daysAgo(9),
      message: "Very interested — discussing price.",
      listingId: listingIdBySlug.get("dha-phase-1-house-7-50cr"),
      assignedAgentId: sana.id,
      createdAt: daysAgo(9),
      lastActivityAt: daysAgo(2),
    },
  });
  await prisma.leadActivity.createMany({
    skipDuplicates: true,
    data: [
      { id: "activity-bilal-1", leadId: bilal.id, type: "PHONE_VERIFIED", message: "Phone number verified via OTP.", createdAt: daysAgo(9) },
      { id: "activity-bilal-2", leadId: bilal.id, type: "VIEWING_REQUESTED", message: "Requested a viewing for DHA Phase 1 · PKR 7.50 Crore.", createdAt: daysAgo(9) },
      { id: "activity-bilal-3", leadId: bilal.id, type: "STATUS_CHANGED", message: "Stage changed to Negotiation.", createdAt: daysAgo(2) },
    ],
  });

  const ayesha = await prisma.lead.upsert({
    where: { id: "lead-ayesha-malik" },
    update: {},
    create: {
      id: "lead-ayesha-malik",
      source: "CONTACT_AGENT",
      status: "CLOSED",
      name: "Ayesha Malik",
      phone: "+923067890123",
      phoneVerified: true,
      verifiedAt: daysAgo(20),
      message: "Ready to proceed.",
      listingId: listingIdBySlug.get("f-10-3-house-5-20cr"),
      assignedAgentId: ahmed.id,
      createdAt: daysAgo(20),
      lastActivityAt: daysAgo(3),
    },
  });
  await prisma.leadActivity.createMany({
    skipDuplicates: true,
    data: [
      { id: "activity-ayesha-1", leadId: ayesha.id, type: "PHONE_VERIFIED", message: "Phone number verified via OTP.", createdAt: daysAgo(20) },
      { id: "activity-ayesha-2", leadId: ayesha.id, type: "CREATED", message: "Requested contact about 4-Bedroom House in F-10/3.", createdAt: daysAgo(20) },
      { id: "activity-ayesha-3", leadId: ayesha.id, type: "CLOSED", message: "Deal closed.", createdAt: daysAgo(3) },
    ],
  });

  const kamran = await prisma.lead.upsert({
    where: { id: "lead-kamran-yousaf" },
    update: {},
    create: {
      id: "lead-kamran-yousaf",
      source: "CONTACT_AGENT",
      status: "LOST",
      name: "Kamran Yousaf",
      phone: "+923078901234",
      phoneVerified: true,
      verifiedAt: daysAgo(15),
      message: "Went with another agency.",
      listingId: listingIdBySlug.get("g-9-plot-1-20cr"),
      assignedAgentId: sana.id,
      createdAt: daysAgo(15),
      lastActivityAt: daysAgo(4),
    },
  });
  await prisma.leadActivity.createMany({
    skipDuplicates: true,
    data: [
      { id: "activity-kamran-1", leadId: kamran.id, type: "PHONE_VERIFIED", message: "Phone number verified via OTP.", createdAt: daysAgo(15) },
      { id: "activity-kamran-2", leadId: kamran.id, type: "CREATED", message: "Requested contact about 6 Marla Residential Plot in G-9.", createdAt: daysAgo(15) },
      { id: "activity-kamran-3", leadId: kamran.id, type: "LOST", message: "Lead marked lost.", createdAt: daysAgo(4) },
    ],
  });

  const fatima = await prisma.lead.upsert({
    where: { id: "lead-fatima-nasir" },
    update: {},
    create: {
      id: "lead-fatima-nasir",
      source: "REQUEST_VIEWING",
      status: "VIEWING_SCHEDULED",
      name: "Fatima Nasir",
      phone: "+923089012345",
      phoneVerified: true,
      verifiedAt: daysAgo(3),
      message: "Looking forward to the visit.",
      listingId: listingIdBySlug.get("e-7-house-9-20cr"),
      assignedAgentId: ahmed.id,
      createdAt: daysAgo(3),
      lastActivityAt: daysAgo(1),
    },
  });
  await prisma.leadActivity.createMany({
    skipDuplicates: true,
    data: [
      { id: "activity-fatima-1", leadId: fatima.id, type: "PHONE_VERIFIED", message: "Phone number verified via OTP.", createdAt: daysAgo(3) },
      { id: "activity-fatima-2", leadId: fatima.id, type: "VIEWING_REQUESTED", message: "Requested a viewing for E-7 · PKR 9.20 Crore.", createdAt: daysAgo(3) },
      { id: "activity-fatima-3", leadId: fatima.id, type: "VIEWING_SCHEDULED", message: "Viewing scheduled with Ahmed Raza.", createdAt: daysAgo(1) },
    ],
  });
  await prisma.viewing.upsert({
    where: { id: "viewing-fatima-1" },
    update: {},
    create: {
      id: "viewing-fatima-1",
      leadId: fatima.id,
      listingId: listingIdBySlug.get("e-7-house-9-20cr") as string,
      agentId: ahmed.id,
      status: "SCHEDULED",
      scheduledAt: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d;
      })(),
      createdAt: daysAgo(1),
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
