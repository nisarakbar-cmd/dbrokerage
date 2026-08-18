"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, ShieldX } from "lucide-react";
import type { ViewingStatus } from "@prisma/client";
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
import type { ViewingsPage } from "@/lib/viewings";
import { VIEWING_STATUS_COLOR, VIEWING_STATUS_LABEL } from "@/lib/pipeline";
import { scheduleViewing } from "@/lib/actions/lead-actions";
import { cancelViewing, markViewingCompleted } from "@/lib/actions/viewing-actions";

const ANY = "any";
const UNASSIGNED = "unassigned";

const VIEWING_STATUS_OPTIONS: { value: ViewingStatus; label: string }[] = [
  { value: "REQUESTED", label: "Requested" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export interface ViewingsTableProps {
  data: ViewingsPage;
  agents: { id: string; name: string }[];
}

function ViewingsTableInner({ data, agents }: ViewingsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [status, setStatus] = useState(searchParams.get("status") ?? ANY);
  const [agentId, setAgentId] = useState(searchParams.get("agent") ?? ANY);
  const [when, setWhen] = useState(searchParams.get("when") ?? ANY);

  function pushParams(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === ANY) params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/admin/viewings?${query}` : "/admin/viewings", { scroll: false });
  }

  function applyFilters() {
    pushParams({ status, agent: agentId, when });
  }

  function clearFilters() {
    setStatus(ANY);
    setAgentId(ANY);
    setWhen(ANY);
    router.push("/admin/viewings", { scroll: false });
  }

  const hasActiveFilters = ["status", "agent", "when"].some((k) => searchParams.has(k));

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/admin/viewings?${params.toString()}`, { scroll: false });
  }

  function startScheduling(viewingId: string, currentScheduledAt: string | null) {
    setSchedulingId(viewingId);
    if (currentScheduledAt) {
      const d = new Date(currentScheduledAt);
      setDate(d.toISOString().slice(0, 10));
      setTime(d.toISOString().slice(11, 16));
    } else {
      setDate("");
      setTime("");
    }
  }

  function confirmSchedule(leadId: string, viewingId: string) {
    if (!date || !time) return;
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    setPendingId(viewingId);
    startTransition(async () => {
      const result = await scheduleViewing(leadId, scheduledAt);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Viewing scheduled.");
        setSchedulingId(null);
      }
      setPendingId(null);
    });
  }

  function handleComplete(viewingId: string) {
    setPendingId(viewingId);
    startTransition(async () => {
      const result = await markViewingCompleted(viewingId);
      if (!result.ok) toast.error(result.error);
      else toast.success("Viewing marked completed.");
      setPendingId(null);
    });
  }

  function handleCancel(viewingId: string) {
    setPendingId(viewingId);
    startTransition(async () => {
      const result = await cancelViewing(viewingId);
      if (!result.ok) toast.error(result.error);
      else toast.success("Viewing cancelled.");
      setPendingId(null);
    });
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full min-w-36 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All statuses</SelectItem>
              {VIEWING_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
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

        <Field label="When">
          <Select value={when} onValueChange={setWhen}>
            <SelectTrigger className="w-full min-w-32 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any time</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
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
              <TableHead>Listing</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.viewings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-text-muted">
                  <p>No viewings match these filters.</p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
            {data.viewings.map((v) => {
              const rowPending = isPending && pendingId === v.id;
              const isScheduling = schedulingId === v.id;
              const isDone = v.status === "COMPLETED" || v.status === "CANCELLED";
              return (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-text">{v.leadName}</span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        {v.leadPhoneVerified ? (
                          <ShieldCheck className="size-3.5 text-success" />
                        ) : (
                          <ShieldX className="size-3.5 text-text-subtle" />
                        )}
                        {v.leadPhoneVerified ? "Verified" : "Not verified"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-text">{v.listingTitle}</span>
                      <span className="text-xs text-text-muted">
                        {v.listingAreaLabel} · {v.listingPrice}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-muted">{v.agentName ?? "Unassigned"}</TableCell>
                  <TableCell className="text-text-muted">
                    {v.scheduledAt
                      ? new Date(v.scheduledAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
                      : "Not scheduled"}
                  </TableCell>
                  <TableCell>
                    <StatusPill color={VIEWING_STATUS_COLOR[v.status]} label={VIEWING_STATUS_LABEL[v.status]} />
                  </TableCell>
                  <TableCell>
                    {isScheduling ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-32" />
                        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-24" />
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={rowPending || !date || !time}
                          onClick={() => confirmSchedule(v.leadId, v.id)}
                        >
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSchedulingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {!isDone && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={rowPending}
                              onClick={() => startScheduling(v.id, v.scheduledAt)}
                            >
                              {v.status === "SCHEDULED" ? "Reschedule" : "Schedule"}
                            </Button>
                            {v.status === "SCHEDULED" && (
                              <Button variant="outline" size="sm" disabled={rowPending} onClick={() => handleComplete(v.id)}>
                                Complete
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" disabled={rowPending} onClick={() => handleCancel(v.id)}>
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>
            Page {data.page} of {totalPages} · {data.total} viewings
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => goToPage(data.page - 1)}>
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

export function ViewingsTable(props: ViewingsTableProps) {
  return (
    <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-bg-surface" />}>
      <ViewingsTableInner {...props} />
    </Suspense>
  );
}
