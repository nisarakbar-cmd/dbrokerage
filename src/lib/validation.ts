import { z } from "zod";
import { normalizePakistaniPhone } from "@/lib/phone";

// Pure zod + lib/phone.ts only — safe to import from Client Components
// (React Hook Form) as well as the OTP route handlers, so the same rules
// run on both sides (§8: "Validate with Zod (client + server)").

export const LEAD_SOURCES = [
  "REQUEST_VIEWING",
  "CONTACT_AGENT",
  "SELL",
  "HOME_ESTIMATOR",
  "MARKET_UPDATES",
] as const;

export type LeadSourceValue = (typeof LEAD_SOURCES)[number];

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform((val, ctx) => {
    const normalized = normalizePakistaniPhone(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid Pakistani mobile number, e.g. 0300 1234567",
      });
      return z.NEVER;
    }
    return normalized;
  });

export const optionalEmailSchema = z
  .union([z.literal(""), z.string().trim().email("Enter a valid email")])
  .optional()
  .transform((v) => (v ? v : undefined));

export const optionalMessageSchema = z
  .string()
  .trim()
  .max(1000, "Keep it under 1000 characters")
  .optional()
  .transform((v) => (v ? v : undefined));

export const otpCodeSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const otpRequestSchema = z.object({
  phone: phoneSchema,
  source: z.enum(LEAD_SOURCES),
  honeypot: z.string().optional(),
});

const leadPayloadSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: optionalEmailSchema,
  message: optionalMessageSchema,
  source: z.enum(LEAD_SOURCES),
  listingId: z.string().optional(),
  propertyInterest: z.string().trim().max(200).optional(),
  preferredTime: z.string().datetime().optional(),
});

export const otpVerifySchema = z
  .object({
    phone: phoneSchema,
    code: otpCodeSchema,
    honeypot: z.string().optional(),
    lead: leadPayloadSchema,
  })
  .refine((data) => data.lead.source !== "REQUEST_VIEWING" || !!data.lead.listingId, {
    message: "A listing is required to request a viewing",
    path: ["lead", "listingId"],
  });

export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
