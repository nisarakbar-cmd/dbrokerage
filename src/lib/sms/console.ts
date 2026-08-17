import type { SmsSender } from "./types";

export const consoleSmsSender: SmsSender = {
  async send(phone, code) {
    console.log(`[sms:console] OTP for ${phone}: ${code}`);
  },
};
