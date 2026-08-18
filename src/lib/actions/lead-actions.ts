"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/assert-admin";
import { STATUS_LABEL } from "@/lib/pipeline";
import { formatPriceRupees } from "@/lib/format";

export interface LeadDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  phoneVerified: boolean;
  verifiedAt: string | null;
  source: string;
  status: LeadStatus;
  message: string | null;
  propertyInterest: string | null;
  listing: { id: string; title: string; areaLabel: string; price: string } | null;
  assignedAgentId: string | null;
  viewing: { id: string; status: string; scheduledAt: string | null } | null;
  notes: { id: string; body: string; createdAt: string }[];
  activities: { id: string; type: string; message: string; createdAt: string }[];
  createdAt: string;
  lastActivityAt: string;
}

export async function getLeadDetail(leadId: string): Promise<LeadDetail | null> {
  await assertAdmin();

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      listing: { select: { id: true, title: true, areaLabel: true, priceRupees: true } },
      notes: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" } },
      viewings: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!lead) return null;

  const viewing = lead.viewings[0];

  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    phoneVerified: lead.phoneVerified,
    verifiedAt: lead.verifiedAt?.toISOString() ?? null,
    source: lead.source,
    status: lead.status,
    message: lead.message,
    propertyInterest: lead.propertyInterest,
    listing: lead.listing
      ? {
          id: lead.listing.id,
          title: lead.listing.title,
          areaLabel: lead.listing.areaLabel,
          price: formatPriceRupees(lead.listing.priceRupees),
        }
      : null,
    assignedAgentId: lead.assignedAgentId,
    viewing: viewing
      ? { id: viewing.id, status: viewing.status, scheduledAt: viewing.scheduledAt?.toISOString() ?? null }
      : null,
    notes: lead.notes.map((n) => ({ id: n.id, body: n.body, createdAt: n.createdAt.toISOString() })),
    activities: lead.activities.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      createdAt: a.createdAt.toISOString(),
    })),
    createdAt: lead.createdAt.toISOString(),
    lastActivityAt: lead.lastActivityAt.toISOString(),
  };
}

export async function setLeadStage(leadId: string, status: LeadStatus) {
  await assertAdmin();
  const now = new Date();

  await db.$transaction([
    db.lead.update({ where: { id: leadId }, data: { status, lastActivityAt: now } }),
    db.leadActivity.create({
      data: { leadId, type: "STATUS_CHANGED", message: `Stage changed to ${STATUS_LABEL[status]}.`, createdAt: now },
    }),
  ]);

  revalidatePath("/admin/leads");
}

export async function assignLead(leadId: string, agentId: string | null) {
  await assertAdmin();
  const now = new Date();

  const agent = agentId ? await db.agent.findUnique({ where: { id: agentId }, select: { name: true } }) : null;

  await db.$transaction([
    db.lead.update({ where: { id: leadId }, data: { assignedAgentId: agentId, lastActivityAt: now } }),
    db.leadActivity.create({
      data: {
        leadId,
        type: "ASSIGNED",
        message: agent ? `Assigned to ${agent.name}.` : "Unassigned.",
        createdAt: now,
      },
    }),
  ]);

  revalidatePath("/admin/leads");
}

export async function scheduleViewing(leadId: string, scheduledAtIso: string, agentId?: string | null) {
  await assertAdmin();
  const now = new Date();
  const scheduledAt = new Date(scheduledAtIso);

  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { listingId: true } });
  if (!lead?.listingId) throw new Error("This lead has no associated listing to schedule a viewing for.");

  const existing = await db.viewing.findFirst({ where: { leadId }, orderBy: { createdAt: "desc" } });

  await db.$transaction(async (tx) => {
    if (existing) {
      await tx.viewing.update({
        where: { id: existing.id },
        data: { status: "SCHEDULED", scheduledAt, agentId: agentId ?? existing.agentId },
      });
    } else {
      await tx.viewing.create({
        data: {
          leadId,
          listingId: lead.listingId as string,
          status: "SCHEDULED",
          scheduledAt,
          agentId: agentId ?? undefined,
        },
      });
    }

    await tx.lead.update({ where: { id: leadId }, data: { status: "VIEWING_SCHEDULED", lastActivityAt: now } });
    await tx.leadActivity.create({
      data: {
        leadId,
        type: "VIEWING_SCHEDULED",
        message: `Viewing scheduled for ${scheduledAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}.`,
        createdAt: now,
      },
    });
  });

  revalidatePath("/admin/leads");
}

export async function addLeadNote(leadId: string, body: string) {
  await assertAdmin();
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Note can't be empty.");
  const now = new Date();

  await db.$transaction([
    db.leadNote.create({ data: { leadId, body: trimmed, createdAt: now } }),
    db.leadActivity.create({ data: { leadId, type: "NOTE_ADDED", message: "Internal note added.", createdAt: now } }),
    db.lead.update({ where: { id: leadId }, data: { lastActivityAt: now } }),
  ]);

  revalidatePath("/admin/leads");
}
