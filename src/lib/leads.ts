import type { LeadSource, LeadStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPriceRupees } from "@/lib/format";
import type { PipelineCounts } from "@/lib/pipeline";

const PAGE_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(daysBeforeToday: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysBeforeToday);
  return d;
}

export interface KpiValue {
  value: number;
  /** Signed count vs. yesterday's same bucket — null when a metric has no
   * honest day-over-day basis (no fabricated deltas). */
  delta: number | null;
}

export interface LeadsKpis {
  newLeads: KpiValue;
  followUpsDue: KpiValue;
  viewingRequests: KpiValue;
  activeListings: KpiValue;
}

export async function getLeadsKpis(): Promise<LeadsKpis> {
  const todayStart = startOfDay(0);
  const yesterdayStart = startOfDay(1);

  const [
    newLeadsCount,
    leadsCreatedToday,
    leadsCreatedYesterday,
    followUpsDueCount,
    viewingRequestsCount,
    viewingsCreatedToday,
    viewingsCreatedYesterday,
    activeListingsCount,
  ] = await Promise.all([
    // New leads = count(status = NEW) — a snapshot of the current backlog.
    db.lead.count({ where: { status: "NEW" } }),
    // Delta basis: leads *created* today vs. yesterday (createdAt is
    // immutable, unlike status, so this is the only honest day-over-day
    // comparison available for a status-based snapshot).
    db.lead.count({ where: { createdAt: { gte: todayStart } } }),
    db.lead.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    // Follow-ups due = count(status NOT IN (CLOSED, LOST) AND lastActivityAt < now - 24h).
    // No historical snapshot of this exists, so no delta is shown for it.
    db.lead.count({
      where: {
        status: { notIn: ["CLOSED", "LOST"] },
        lastActivityAt: { lt: new Date(Date.now() - DAY_MS) },
      },
    }),
    // Viewing requests = count(Viewing where status = REQUESTED) — pending scheduling.
    db.viewing.count({ where: { status: "REQUESTED" } }),
    // Delta basis: viewings *created* today vs. yesterday (same reasoning as leads above).
    db.viewing.count({ where: { createdAt: { gte: todayStart } } }),
    db.viewing.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    // Active listings = count(published = true AND availability IN (AVAILABLE, UNDER_OFFER)).
    // No day-over-day flow to compare against (listing status doesn't have
    // a creation-timestamp-driven "today vs yesterday" reading), so no delta.
    db.listing.count({ where: { published: true, availability: { in: ["AVAILABLE", "UNDER_OFFER"] } } }),
  ]);

  return {
    newLeads: { value: newLeadsCount, delta: leadsCreatedToday - leadsCreatedYesterday },
    followUpsDue: { value: followUpsDueCount, delta: null },
    viewingRequests: { value: viewingRequestsCount, delta: viewingsCreatedToday - viewingsCreatedYesterday },
    activeListings: { value: activeListingsCount, delta: null },
  };
}

export async function getPipelineCounts(): Promise<PipelineCounts> {
  const grouped = await db.lead.groupBy({ by: ["status"], _count: { _all: true } });
  const byStatus = Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Record<LeadStatus, number | undefined>;
  const get = (s: LeadStatus) => byStatus[s] ?? 0;

  return {
    NEW: get("NEW"),
    CONTACTED: get("CONTACTED"),
    QUALIFIED: get("QUALIFIED"),
    VIEWING: get("VIEWING_REQUESTED") + get("VIEWING_SCHEDULED"),
    NEGOTIATION: get("NEGOTIATION"),
    CLOSED: get("CLOSED"),
    LOST: get("LOST"),
  };
}

export interface LeadsTableFilters {
  source?: LeadSource;
  agentId?: string; // "unassigned" is a sentinel, handled below
  status?: LeadStatus;
  phoneVerified?: boolean;
  search?: string;
  page?: number;
}

const LEAD_SOURCE_SET = new Set<string>(["REQUEST_VIEWING", "CONTACT_AGENT", "SELL", "HOME_ESTIMATOR", "MARKET_UPDATES"]);
const LEAD_STATUS_SET = new Set<string>([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "VIEWING_REQUESTED",
  "VIEWING_SCHEDULED",
  "NEGOTIATION",
  "CLOSED",
  "LOST",
]);

/** Parses raw URL searchParams into typed, validated table filters. */
export function parseLeadsFilters(searchParams: Record<string, string | string[] | undefined>): LeadsTableFilters {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const source = get("source");
  const status = get("status");
  const verified = get("verified");
  const page = get("page");

  return {
    source: source && LEAD_SOURCE_SET.has(source) ? (source as LeadSource) : undefined,
    status: status && LEAD_STATUS_SET.has(status) ? (status as LeadStatus) : undefined,
    agentId: get("agent") || undefined,
    phoneVerified: verified === "true" ? true : verified === "false" ? false : undefined,
    search: get("search") || undefined,
    page: page ? Math.max(1, parseInt(page, 10) || 1) : 1,
  };
}

export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  phoneVerified: boolean;
  source: LeadSource;
  status: LeadStatus;
  propertyLabel: string;
  assignedAgentName: string | null;
  lastActivityAt: Date;
}

export interface LeadsTablePage {
  leads: LeadRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getLeadsTablePage(filters: LeadsTableFilters): Promise<LeadsTablePage> {
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.LeadWhereInput = {};
  if (filters.source) where.source = filters.source;
  if (filters.status) where.status = filters.status;
  if (filters.phoneVerified !== undefined) where.phoneVerified = filters.phoneVerified;
  if (filters.agentId === "unassigned") where.assignedAgentId = null;
  else if (filters.agentId) where.assignedAgentId = filters.agentId;

  if (filters.search) {
    const q = filters.search;
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { propertyInterest: { contains: q, mode: "insensitive" } },
      { listing: { is: { areaLabel: { contains: q, mode: "insensitive" } } } },
      { listing: { is: { title: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [total, rows] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      include: {
        listing: { select: { areaLabel: true, title: true, priceRupees: true } },
        assignedAgent: { select: { name: true } },
      },
      orderBy: { lastActivityAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    total,
    page,
    pageSize: PAGE_SIZE,
    leads: rows.map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      phoneVerified: l.phoneVerified,
      source: l.source,
      status: l.status,
      propertyLabel: l.listing
        ? `${l.listing.areaLabel} · ${formatPriceRupees(l.listing.priceRupees)}`
        : (l.propertyInterest ?? "—"),
      assignedAgentName: l.assignedAgent?.name ?? null,
      lastActivityAt: l.lastActivityAt,
    })),
  };
}
