import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashOtpCode, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { otpVerifySchema, type LeadSourceValue } from "@/lib/validation";

const GENERIC_ERROR = "That code didn't work. Check the code or request a new one.";

function buildInitialActivityMessage(source: LeadSourceValue, listingTitle?: string): string {
  switch (source) {
    case "REQUEST_VIEWING":
      return `Requested a viewing${listingTitle ? ` for ${listingTitle}` : ""}.`;
    case "CONTACT_AGENT":
      return `Requested contact${listingTitle ? ` about ${listingTitle}` : ""}.`;
    case "SELL":
      return "Submitted a sell inquiry.";
    case "HOME_ESTIMATOR":
      return "Requested a home estimate.";
    case "MARKET_UPDATES":
      return "Signed up for market updates.";
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: respond exactly like an invalid code — no distinguishable signal.
  if (typeof (body as Record<string, unknown>).honeypot === "string" && (body as { honeypot: string }).honeypot.length > 0) {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 400 });
  }

  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const { phone, code, lead } = parsed.data;

  const challenge = await db.otpChallenge.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.attempts >= OTP_MAX_ATTEMPTS) {
    if (challenge) {
      await db.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
    }
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 400 });
  }

  if (hashOtpCode(code) !== challenge.codeHash) {
    const attempts = challenge.attempts + 1;
    await db.otpChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts,
        ...(attempts >= OTP_MAX_ATTEMPTS ? { consumedAt: new Date() } : {}),
      },
    });
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 400 });
  }

  const now = new Date();
  const isScheduledViewing = lead.source === "REQUEST_VIEWING" && !!lead.preferredTime && !!lead.listingId;

  try {
    const createdLead = await db.$transaction(async (tx) => {
      await tx.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: now } });

      const listing = lead.listingId
        ? await tx.listing.findUnique({ where: { id: lead.listingId }, select: { title: true } })
        : null;

      const newLead = await tx.lead.create({
        data: {
          source: lead.source,
          status: isScheduledViewing ? "VIEWING_REQUESTED" : "NEW",
          name: lead.name,
          phone,
          email: lead.email,
          phoneVerified: true,
          verifiedAt: now,
          message: lead.message,
          propertyInterest: lead.propertyInterest,
          preferredTime: lead.preferredTime ? new Date(lead.preferredTime) : undefined,
          listingId: lead.listingId,
          lastActivityAt: now,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId: newLead.id,
          type: "PHONE_VERIFIED",
          message: "Phone number verified via OTP.",
          createdAt: now,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId: newLead.id,
          type: lead.source === "REQUEST_VIEWING" ? "VIEWING_REQUESTED" : "CREATED",
          message: buildInitialActivityMessage(lead.source, listing?.title),
          createdAt: now,
        },
      });

      if (isScheduledViewing) {
        await tx.viewing.create({
          data: {
            leadId: newLead.id,
            listingId: lead.listingId as string,
            status: "REQUESTED",
            scheduledAt: new Date(lead.preferredTime as string),
          },
        });
      }

      return newLead;
    });

    return NextResponse.json({ ok: true, leadId: createdLead.id });
  } catch (error) {
    console.error("[otp/verify] failed", error);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
