import { consoleSmsSender } from "./console";
import { twilioSmsSender } from "./twilio";
import type { SmsSender } from "./types";

export type { SmsSender };

export function getSmsSender(): SmsSender {
  const provider = process.env.SMS_PROVIDER ?? "console";

  switch (provider) {
    case "console":
      return consoleSmsSender;
    case "twilio":
      // See lib/sms/twilio.ts — untested without real credentials, and
      // TWILIO_VERIFY_SERVICE_SID is reserved/unused by this simple impl.
      return twilioSmsSender;
    default:
      throw new Error(`Unknown SMS_PROVIDER "${provider}"`);
  }
}
