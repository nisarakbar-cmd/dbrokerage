"use client";

import { useState } from "react";
import { LeadsTable } from "@/components/admin/leads-table";
import { LeadDrawer } from "@/components/admin/lead-drawer";
import type { LeadsTablePage } from "@/lib/leads";

export interface LeadsViewProps {
  data: LeadsTablePage;
  agents: { id: string; name: string }[];
}

export function LeadsView({ data, agents }: LeadsViewProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  return (
    <>
      <LeadsTable data={data} agents={agents} selectedLeadId={selectedLeadId} onRowClick={setSelectedLeadId} />
      <LeadDrawer leadId={selectedLeadId} agents={agents} onClose={() => setSelectedLeadId(null)} />
    </>
  );
}
