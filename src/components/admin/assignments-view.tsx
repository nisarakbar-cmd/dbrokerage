"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserRound, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/pipeline";
import type { AssignmentAgentGroup } from "@/lib/assignments";
import { assignLead } from "@/lib/actions/lead-actions";
import { cn } from "@/lib/utils";

const UNASSIGNED = "unassigned";

export interface AssignmentsViewProps {
  groups: AssignmentAgentGroup[];
  agents: { id: string; name: string }[];
}

export function AssignmentsView({ groups, agents }: AssignmentsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);

  function handleReassign(leadId: string, agentId: string) {
    setPendingLeadId(leadId);
    startTransition(async () => {
      const result = await assignLead(leadId, agentId === UNASSIGNED ? null : agentId);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        const agentName = agents.find((a) => a.id === agentId)?.name;
        toast.success(agentName ? `Reassigned to ${agentName}.` : "Unassigned.");
      }
      setPendingLeadId(null);
    });
  }

  if (groups.every((g) => g.totalCount === 0)) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-surface p-10 text-center">
        <Users className="size-8 text-text-subtle" aria-hidden="true" />
        <p className="text-sm font-medium text-text">No leads yet</p>
        <p className="text-sm text-text-muted">Once leads come in, they&apos;ll show up here grouped by agent.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section
          key={group.agentId ?? "unassigned"}
          className={cn(
            "flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-5",
            group.agentId === null && group.totalCount > 0 && "border-primary/40"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-text-muted" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text">{group.agentName}</h2>
              {group.agentId === null && group.totalCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Needs assignment
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>
                <span className="font-medium tabular-nums text-text">{group.activeCount}</span> active
              </span>
              <span>
                <span className="font-medium tabular-nums text-text">{group.totalCount}</span> total
              </span>
            </div>
          </div>

          {group.statusBreakdown.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {group.statusBreakdown.map(({ status, count }) => (
                <StatusPill key={status} color={STATUS_COLOR[status]} label={`${STATUS_LABEL[status]} · ${count}`} />
              ))}
            </div>
          )}

          {group.leads.length === 0 ? (
            <p className="text-sm text-text-muted">No leads.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {group.leads.map((lead) => (
                <div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-text">{lead.name}</span>
                    <span className="text-xs text-text-muted">
                      {lead.phone} · {lead.propertyLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill color={STATUS_COLOR[lead.status]} label={STATUS_LABEL[lead.status]} />
                    <Select
                      value={group.agentId ?? UNASSIGNED}
                      onValueChange={(v) => handleReassign(lead.id, v)}
                      disabled={isPending && pendingLeadId === lead.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                        {agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
