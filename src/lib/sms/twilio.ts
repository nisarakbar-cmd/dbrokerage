import type { SmsSender } from "./types";

// Sends our own OTP code via Twilio's plain Messaging API — fits
// SmsSender's send(phone, code) contract as-is. UNTESTED: built without
// access to real Twilio credentials, so verify against a live account
// before relying on it in production.
//
// TWILIO_VERIFY_SERVICE_SID is intentionally unused here. Twilio's Verify
// product generates and checks its own codes server-side; it can't be
// handed a code we already generated and hashed (see lib/otp.ts), so it
// doesn't fit this interface. A real Verify integration would mean
// restructuring /api/otp/request and /api/otp/verify to delegate code
// generation and checking to Twilio directly, replacing our own
// OtpChallenge/codeHash flow rather than sitting behind SmsSender.
export const twilioSmsSender: SmsSender = {
  async send(phone, code) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error(
        "Twilio is not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER."
      );
    }

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const body = new URLSearchParams({
      To: phone,
      From: fromNumber,
      Body: `Your dBrokerage verification code is ${code}. It expires in 5 minutes.`,
    });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Twilio send failed (${res.status}): ${detail}`);
    }
  },
};
