"use client";

import { useEffect, useState, useTransition } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Sparkles,
  StickyNote,
  UserCog,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/format";
import { LEAD_SOURCE_LABEL, LEAD_STATUS_VALUES, STATUS_COLOR, STATUS_LABEL } from "@/lib/pipeline";
import type { LeadSource } from "@prisma/client";
import {
  addLeadNote,
  assignLead,
  getLeadDetail,
  scheduleViewing,
  setLeadStage,
  type LeadDetail,
} from "@/lib/actions/lead-actions";

const UNASSIGNED = "unassigned";

const ACTIVITY_ICON: Record<string, LucideIcon> = {
  PHONE_VERIFIED: ShieldCheck,
  CREATED: Sparkles,
  CONTACTED: Phone,
  QUALIFIED: CheckCircle2,
  VIEWING_REQUESTED: CalendarClock,
  VIEWING_SCHEDULED: CalendarCheck,
  ASSIGNED: UserCog,
  STATUS_CHANGED: RefreshCw,
  NOTE_ADDED: StickyNote,
  CLOSED: CheckCircle2,
  LOST: XCircle,
};

export interface LeadDrawerProps {
  leadId: string | null;
  agents: { id: string; name: string }[];
  onClose: () => void;
}

export function LeadDrawer({ leadId, agents, onClose }: LeadDrawerProps) {
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("");
  const [isPending, startTransition] = useTransition();

  async function refresh(id: string) {
    setLoading(true);
    const data = await getLeadDetail(id);
    setDetail(data);
    setLoading(false);
  }

  useEffect(() => {
    if (!leadId) {
      setDetail(null);
      setNoteBody("");
      setViewingDate("");
      setViewingTime("");
      return;
    }
    void refresh(leadId);
  }, [leadId]);

  function handleStageChange(status: string) {
    if (!detail) return;
    startTransition(async () => {
      await setLeadStage(detail.id, status as LeadDetail["status"]);
      await refresh(detail.id);
    });
  }

  function handleAssignChange(agentId: string) {
    if (!detail) return;
    startTransition(async () => {
      await assignLead(detail.id, agentId === UNASSIGNED ? null : agentId);
      await refresh(detail.id);
    });
  }

  function handleScheduleViewing() {
    if (!detail || !viewingDate || !viewingTime) return;
    const scheduledAt = new Date(`${viewingDate}T${viewingTime}`).toISOString();
    startTransition(async () => {
      await scheduleViewing(detail.id, scheduledAt);
      setViewingDate("");
      setViewingTime("");
      await refresh(detail.id);
    });
  }

  function handleSaveNote() {
    if (!detail || !noteBody.trim()) return;
    startTransition(async () => {
      await addLeadNote(detail.id, noteBody.trim());
      setNoteBody("");
      await refresh(detail.id);
    });
  }

  return (
    <Sheet open={!!leadId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {loading || !detail ? (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">Loading…</div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{detail.name}</SheetTitle>
              <SheetDescription>{LEAD_SOURCE_LABEL[detail.source as LeadSource]}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-4">
              {/* Contact */}
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-medium tracking-wide text-text-muted uppercase">Contact</h3>
                <div className="flex items-center gap-2">
                  {detail.phoneVerified ? (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      <ShieldCheck className="size-3.5" /> Phone verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-bg-elevated px-2 py-0.5 text-xs font-medium text-text-muted">
                      <ShieldX className="size-3.5" /> Not verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-text">{detail.phone}</p>
                {detail.email && <p className="text-sm text-text-muted">{detail.email}</p>}
                {detail.message && <p className="text-sm text-text-muted italic">“{detail.message}”</p>}
              </section>

              {/* Property interest */}
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-medium tracking-wide text-text-muted uppercase">Property interest</h3>
                {detail.listing ? (
                  <div className="rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm">
                    <p className="font-medium text-text">{detail.listing.title}</p>
                    <div className="mt-1 flex items-center justify-between text-text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 shrink-0" /> {detail.listing.areaLabel}
                      </span>
                      <span className="font-medium tabular-nums text-text">{detail.listing.price}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">{detail.propertyInterest ?? "—"}</p>
                )}
              </section>

              {/* Assign + stage */}
              <section className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-text-muted">Assigned to</span>
                  <Select
                    value={detail.assignedAgentId ?? UNASSIGNED}
                    onValueChange={handleAssignChange}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
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
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-text-muted">Stage</span>
                  <Select value={detail.status} onValueChange={handleStageChange} disabled={isPending}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUS_VALUES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              {/* Viewing */}
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-medium tracking-wide text-text-muted uppercase">Viewing</h3>
                {detail.viewing ? (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm">
                    <span className="text-text">
                      {STATUS_LABEL[detail.viewing.status === "REQUESTED" ? "VIEWING_REQUESTED" : "VIEWING_SCHEDULED"]}
                    </span>
                    <span className="text-text-muted">
                      {detail.viewing.scheduledAt
                        ? new Date(detail.viewing.scheduledAt).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "No time set"}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">No viewing requested.</p>
                )}
                {detail.listing && (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="date" value={viewingDate} onChange={(e) => setViewingDate(e.target.value)} />
                      <Input type="time" value={viewingTime} onChange={(e) => setViewingTime(e.target.value)} />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending || !viewingDate || !viewingTime}
                      onClick={handleScheduleViewing}
                    >
                      Schedule viewing
                    </Button>
                  </div>
                )}
              </section>

              {/* Internal notes */}
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-medium tracking-wide text-text-muted uppercase">Internal notes</h3>
                <div className="flex flex-col gap-2">
                  {detail.notes.length === 0 && <p className="text-sm text-text-muted">No notes yet.</p>}
                  {detail.notes.map((n) => (
                    <div key={n.id} className="rounded-lg bg-bg-elevated px-3 py-2 text-sm">
                      <p className="text-text">{n.body}</p>
                      <p className="mt-1 text-xs text-text-subtle">{formatRelativeTime(new Date(n.createdAt))}</p>
                    </div>
                  ))}
                </div>
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  rows={2}
                  placeholder="Add an internal note…"
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                <Button variant="outline" size="sm" disabled={isPending || !noteBody.trim()} onClick={handleSaveNote}>
                  Save note
                </Button>
              </section>

              {/* Activity timeline */}
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-medium tracking-wide text-text-muted uppercase">Activity</h3>
                <ol className="flex flex-col gap-3">
                  {detail.activities.map((a) => {
                    const Icon = ACTIVITY_ICON[a.type] ?? Sparkles;
                    return (
                      <li key={a.id} className="flex items-start gap-2.5 text-sm">
                        <span
                          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `color-mix(in oklch, ${statusColorForActivity(a.type)} 20%, transparent)` }}
                        >
                          <Icon className="size-3.5" style={{ color: statusColorForActivity(a.type) }} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-text">{a.message}</p>
                          <p className="text-xs text-text-subtle">{formatRelativeTime(new Date(a.createdAt))}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {/* Ownership-docs note — always visible, no upload field anywhere */}
              <div className="rounded-lg border border-border bg-bg-elevated p-3 text-xs text-text-muted">
                Verification checklist data only. Do not upload ownership documents.
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function statusColorForActivity(type: string): string {
  switch (type) {
    case "STATUS_CHANGED":
    case "QUALIFIED":
      return STATUS_COLOR.QUALIFIED;
    case "VIEWING_REQUESTED":
    case "VIEWING_SCHEDULED":
      return STATUS_COLOR.VIEWING_REQUESTED;
    case "CLOSED":
      return STATUS_COLOR.CLOSED;
    case "LOST":
      return STATUS_COLOR.LOST;
    case "PHONE_VERIFIED":
      return "var(--success)";
    default:
      return "var(--text-muted)";
  }
}
