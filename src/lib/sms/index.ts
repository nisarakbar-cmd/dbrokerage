import { consoleSmsSender } from "./console";
import type { SmsSender } from "./types";

export type { SmsSender };

export function getSmsSender(): SmsSender {
  const provider = process.env.SMS_PROVIDER ?? "console";

  switch (provider) {
    case "console":
      return consoleSmsSender;
    default:
      throw new Error(`Unknown SMS_PROVIDER "${provider}"`);
  }
}
