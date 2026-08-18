import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSmsSender } from "@/lib/sms";
import { checkOtpRateLimit } from "@/lib/ratelimit";
import {
  generateOtpCode,
  hashOtpCode,
  OTP_EXPIRY_MINUTES,
  OTP_REQUEST_LIMIT_PER_IP,
  OTP_REQUEST_LIMIT_PER_PHONE,
  OTP_REQUEST_WINDOW_MS,
} from "@/lib/otp";
import { otpRequestSchema } from "@/lib/validation";

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill this in — pretend success, do nothing.
  if (typeof (body as Record<string, unknown>).honeypot === "string" && (body as { honeypot: string }).honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = otpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const { phone } = parsed.data;
  const ip = getClientIp(request);

  const [phoneOk, ipOk] = await Promise.all([
    checkOtpRateLimit({ phone }, { limit: OTP_REQUEST_LIMIT_PER_PHONE, windowMs: OTP_REQUEST_WINDOW_MS }),
    ip
      ? checkOtpRateLimit({ ip }, { limit: OTP_REQUEST_LIMIT_PER_IP, windowMs: OTP_REQUEST_WINDOW_MS })
      : Promise.resolve(true),
  ]);

  if (!phoneOk || !ipOk) {
    return NextResponse.json(
      { ok: false, error: "Too many requests — please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const code = generateOtpCode();
  const codeHash = hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  try {
    await db.$transaction([
      // Invalidate any prior unconsumed challenges for this phone.
      db.otpChallenge.updateMany({
        where: { phone, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      db.otpChallenge.create({
        data: { phone, codeHash, expiresAt, ip: ip ?? undefined },
      }),
    ]);

    await getSmsSender().send(phone, code);
  } catch (error) {
    console.error("[otp/request] failed", error);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
