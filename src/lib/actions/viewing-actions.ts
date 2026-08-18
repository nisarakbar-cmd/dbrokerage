"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/assert-admin";
import type { ActionResult } from "@/lib/action-result";

// Scheduling/rescheduling reuses lead-actions.ts's scheduleViewing directly
// (called with the Viewing's leadId) rather than duplicating that logic —
// only "mark completed" and "cancel" are new here.

export async function markViewingCompleted(viewingId: string): Promise<ActionResult> {
  const admin = await assertAdmin();
  const viewing = await db.viewing.findUnique({ where: { id: viewingId } });
  if (!viewing) return { ok: false, error: "Viewing not found." };
  if (viewing.status === "COMPLETED") return { ok: true };

  const now = new Date();

  await db.$transaction([
    db.viewing.update({ where: { id: viewingId }, data: { status: "COMPLETED" } }),
    db.lead.update({ where: { id: viewing.leadId }, data: { lastActivityAt: now } }),
    // No dedicated ActivityType for viewing completion exists (this
    // milestone adds no migration) — STATUS_CHANGED is the closest fit and
    // the message text carries the specific meaning in the timeline.
    db.leadActivity.create({
      data: {
        leadId: viewing.leadId,
        type: "STATUS_CHANGED",
        message: "Viewing marked completed.",
        createdAt: now,
        actorId: admin.id,
      },
    }),
  ]);

  revalidatePath("/admin/viewings");
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function cancelViewing(viewingId: string): Promise<ActionResult> {
  const admin = await assertAdmin();
  const viewing = await db.viewing.findUnique({ where: { id: viewingId } });
  if (!viewing) return { ok: false, error: "Viewing not found." };
  if (viewing.status === "CANCELLED") return { ok: true };

  const now = new Date();

  await db.$transaction([
    db.viewing.update({ where: { id: viewingId }, data: { status: "CANCELLED" } }),
    db.lead.update({ where: { id: viewing.leadId }, data: { lastActivityAt: now } }),
    db.leadActivity.create({
      data: {
        leadId: viewing.leadId,
        type: "STATUS_CHANGED",
        message: "Viewing cancelled.",
        createdAt: now,
        actorId: admin.id,
      },
    }),
  ]);

  revalidatePath("/admin/viewings");
  revalidatePath("/admin/leads");
  return { ok: true };
}
