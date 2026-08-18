import type { Prisma, ViewingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPriceRupees } from "@/lib/format";

const PAGE_SIZE = 15;

export interface ViewingsFilters {
  status?: ViewingStatus;
  agentId?: string;
  when?: "upcoming" | "past";
  page?: number;
}

export interface ViewingRow {
  id: string;
  leadId: string;
  leadName: string;
  leadPhoneVerified: boolean;
  listingTitle: string;
  listingAreaLabel: string;
  listingPrice: string;
  agentName: string | null;
  scheduledAt: string | null;
  status: ViewingStatus;
}

export interface ViewingsPage {
  viewings: ViewingRow[];
  total: number;
  page: number;
  pageSize: number;
}

const VIEWING_STATUS_SET = new Set(["REQUESTED", "SCHEDULED", "COMPLETED", "CANCELLED"]);

export function parseViewingsFilters(
  searchParams: Record<string, string | string[] | undefined>
): ViewingsFilters {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const status = get("status");
  const when = get("when");
  const page = get("page");

  return {
    status: status && VIEWING_STATUS_SET.has(status) ? (status as ViewingStatus) : undefined,
    agentId: get("agent") || undefined,
    when: when === "upcoming" || when === "past" ? when : undefined,
    page: page ? Math.max(1, parseInt(page, 10) || 1) : 1,
  };
}

export async function getViewingsPage(filters: ViewingsFilters): Promise<ViewingsPage> {
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.ViewingWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.agentId === "unassigned") where.agentId = null;
  else if (filters.agentId) where.agentId = filters.agentId;
  if (filters.when === "upcoming") where.scheduledAt = { gte: new Date() };
  else if (filters.when === "past") where.scheduledAt = { lt: new Date() };

  const [total, rows] = await Promise.all([
    db.viewing.count({ where }),
    db.viewing.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, phoneVerified: true } },
        listing: { select: { title: true, areaLabel: true, priceRupees: true } },
        agent: { select: { name: true } },
      },
      // ViewingStatus is declared REQUESTED, SCHEDULED, COMPLETED, CANCELLED —
      // Postgres sorts enums by declaration order, so this naturally puts
      // unscheduled requests first, then upcoming-soonest, then done/dead.
      orderBy: [{ status: "asc" }, { scheduledAt: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    total,
    page,
    pageSize: PAGE_SIZE,
    viewings: rows.map((v) => ({
      id: v.id,
      leadId: v.lead.id,
      leadName: v.lead.name,
      leadPhoneVerified: v.lead.phoneVerified,
      listingTitle: v.listing.title,
      listingAreaLabel: v.listing.areaLabel,
      listingPrice: formatPriceRupees(v.listing.priceRupees),
      agentName: v.agent?.name ?? null,
      scheduledAt: v.scheduledAt?.toISOString() ?? null,
      status: v.status,
    })),
  };
}
