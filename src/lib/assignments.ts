import type { LeadStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPriceRupees } from "@/lib/format";

const TERMINAL_STATUSES: LeadStatus[] = ["CLOSED", "LOST"];

export interface AssignmentLeadRow {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  propertyLabel: string;
}

export interface AssignmentAgentGroup {
  agentId: string | null; // null = Unassigned
  agentName: string;
  activeCount: number;
  totalCount: number;
  statusBreakdown: { status: LeadStatus; count: number }[];
  leads: AssignmentLeadRow[];
}

export async function getAssignmentsData(): Promise<AssignmentAgentGroup[]> {
  const [agents, leads] = await Promise.all([
    db.agent.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.lead.findMany({
      include: {
        assignedAgent: { select: { id: true, name: true } },
        listing: { select: { areaLabel: true, priceRupees: true } },
      },
      orderBy: { lastActivityAt: "desc" },
    }),
  ]);

  const groups = new Map<string, AssignmentAgentGroup>();
  groups.set("unassigned", {
    agentId: null,
    agentName: "Unassigned",
    activeCount: 0,
    totalCount: 0,
    statusBreakdown: [],
    leads: [],
  });
  for (const agent of agents) {
    groups.set(agent.id, {
      agentId: agent.id,
      agentName: agent.name,
      activeCount: 0,
      totalCount: 0,
      statusBreakdown: [],
      leads: [],
    });
  }

  const statusCounts = new Map<string, Map<LeadStatus, number>>();

  for (const lead of leads) {
    const key = lead.assignedAgentId ?? "unassigned";
    let group = groups.get(key);
    if (!group) {
      // Assigned to an agent that's since gone inactive — still surface them.
      group = {
        agentId: lead.assignedAgentId,
        agentName: lead.assignedAgent?.name ?? "Former agent",
        activeCount: 0,
        totalCount: 0,
        statusBreakdown: [],
        leads: [],
      };
      groups.set(key, group);
    }

    group.totalCount += 1;
    if (!TERMINAL_STATUSES.includes(lead.status)) group.activeCount += 1;

    const counts = statusCounts.get(key) ?? new Map<LeadStatus, number>();
    counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1);
    statusCounts.set(key, counts);

    group.leads.push({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      status: lead.status,
      propertyLabel: lead.listing
        ? `${lead.listing.areaLabel} · ${formatPriceRupees(lead.listing.priceRupees)}`
        : (lead.propertyInterest ?? "—"),
    });
  }

  for (const [key, group] of groups) {
    const counts = statusCounts.get(key);
    if (counts) {
      group.statusBreakdown = Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
    }
  }

  // Unassigned first — that's the actionable bucket — then agents alphabetically.
  const unassigned = groups.get("unassigned") as AssignmentAgentGroup;
  groups.delete("unassigned");
  const rest = Array.from(groups.values()).sort((a, b) => a.agentName.localeCompare(b.agentName));
  return [unassigned, ...rest];
}
