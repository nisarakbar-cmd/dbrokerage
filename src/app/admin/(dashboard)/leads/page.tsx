import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getLeadsKpis, getLeadsTablePage, getPipelineCounts, parseLeadsFilters } from "@/lib/leads";
import { KpiCard } from "@/components/admin/kpi-card";
import { PipelineBoard } from "@/components/admin/pipeline-board";
import { LeadsView } from "@/components/admin/leads-view";

export const metadata: Metadata = { title: "Leads & Pipeline | dBrokerage Admin" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const filters = parseLeadsFilters(rawParams);

  const [kpis, pipelineCounts, tablePage, agents] = await Promise.all([
    getLeadsKpis(),
    getPipelineCounts(),
    getLeadsTablePage(filters),
    db.agent.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-text">Leads & Pipeline</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="New leads" value={kpis.newLeads.value} delta={kpis.newLeads.delta} />
        <KpiCard label="Follow-ups due" value={kpis.followUpsDue.value} delta={kpis.followUpsDue.delta} />
        <KpiCard label="Viewing requests" value={kpis.viewingRequests.value} delta={kpis.viewingRequests.delta} />
        <KpiCard label="Active listings" value={kpis.activeListings.value} delta={kpis.activeListings.delta} />
      </div>

      <PipelineBoard counts={pipelineCounts} />

      <LeadsView data={tablePage} agents={agents} />
    </div>
  );
}
