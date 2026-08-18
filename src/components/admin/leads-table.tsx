"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ShieldX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { formatRelativeTime } from "@/lib/format";
import {
  LEAD_SOURCE_LABEL,
  LEAD_SOURCE_VALUES,
  LEAD_STATUS_VALUES,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/pipeline";
import type { LeadsTablePage } from "@/lib/leads";
import { cn } from "@/lib/utils";

const ANY = "any";
const UNASSIGNED = "unassigned";

export interface LeadsTableProps {
  data: LeadsTablePage;
  agents: { id: string; name: string }[];
  selectedLeadId: string | null;
  onRowClick: (leadId: string) => void;
}

function LeadsTableInner({ data, agents, selectedLeadId, onRowClick }: LeadsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [source, setSource] = useState(searchParams.get("source") ?? ANY);
  const [agentId, setAgentId] = useState(searchParams.get("agent") ?? ANY);
  const [status, setStatus] = useState(searchParams.get("status") ?? ANY);
  const [verified, setVerified] = useState(searchParams.get("verified") ?? ANY);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function pushParams(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === ANY || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page"); // any filter change resets pagination
    const query = params.toString();
    router.push(query ? `/admin/leads?${query}` : "/admin/leads", { scroll: false });
  }

  function applyFilters() {
    pushParams({ source, agent: agentId, status, verified, search });
  }

  function clearFilters() {
    setSource(ANY);
    setAgentId(ANY);
    setStatus(ANY);
    setVerified(ANY);
    setSearch("");
    router.push("/admin/leads", { scroll: false });
  }

  const hasActiveFilters = ["source", "agent", "status", "verified", "search"].some((k) => searchParams.has(k));

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/admin/leads?${params.toString()}`, { scroll: false });
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Source">
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-full min-w-36 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All sources</SelectItem>
              {LEAD_SOURCE_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {LEAD_SOURCE_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Agent">
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger className="w-full min-w-32 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All agents</SelectItem>
              <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full min-w-36 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All statuses</SelectItem>
              {LEAD_STATUS_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Phone-verified">
          <Select value={verified} onValueChange={setVerified}>
            <SelectTrigger className="w-full min-w-32 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Not verified</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Search">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Name, phone, property…"
            className="w-full min-w-48 sm:w-auto"
          />
        </Field>

        <Button variant="primary" size="sm" onClick={applyFilters}>
          Apply
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Inquiry source</TableHead>
              <TableHead>Property / Interest</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-text-muted">
                  <p>No leads match these filters.</p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
            {data.leads.map((lead) => (
              <TableRow
                key={lead.id}
                tabIndex={0}
                role="button"
                aria-label={`Open ${lead.name}`}
                onClick={() => onRowClick(lead.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick(lead.id);
                  }
                }}
                className={cn(
                  "cursor-pointer outline-none focus-visible:bg-bg-elevated focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  selectedLeadId === lead.id && "bg-bg-elevated"
                )}
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-text">{lead.name}</span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      {lead.phoneVerified ? (
                        <ShieldCheck className="size-3.5 text-success" />
                      ) : (
                        <ShieldX className="size-3.5 text-text-subtle" />
                      )}
                      {lead.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-text-muted">{LEAD_SOURCE_LABEL[lead.source]}</TableCell>
                <TableCell className="max-w-56 truncate text-text-muted">{lead.propertyLabel}</TableCell>
                <TableCell className="text-text-muted">{lead.assignedAgentName ?? "Unassigned"}</TableCell>
                <TableCell>
                  <StatusPill color={STATUS_COLOR[lead.status]} label={STATUS_LABEL[lead.status]} />
                </TableCell>
                <TableCell className="text-text-muted">{formatRelativeTime(lead.lastActivityAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>
            Page {data.page} of {totalPages} · {data.total} leads
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => goToPage(data.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= totalPages}
              onClick={() => goToPage(data.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-text-muted uppercase">{label}</span>
      {children}
    </div>
  );
}

export function LeadsTable(props: LeadsTableProps) {
  return (
    <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-bg-surface" />}>
      <LeadsTableInner {...props} />
    </Suspense>
  );
}
