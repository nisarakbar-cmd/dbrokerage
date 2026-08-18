import { z } from "zod";

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const photoInputSchema = z.object({
  url: z.string().trim().url("Enter a valid image URL"),
  alt: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const listingFormSchema = z
  .object({
    title: z.string().trim().min(3, "Enter a title").max(200),
    slug: z
      .string()
      .trim()
      .min(3, "Slug is too short")
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only")
      .optional(),
    description: z.string().trim().min(10, "Enter a description").max(5000),
    propertyType: z.enum(["HOUSE", "APARTMENT", "PLOT"]),

    priceCrore: z.coerce.number().positive("Enter a price"),

    city: z.string().trim().min(1, "Enter a city").max(100),
    zone: z.enum(["CDA", "DHA", "BAHRIA_TOWN", "BAHRIA_ENCLAVE", "PRIVATE_SCHEME"]),
    sector: optionalTrimmed(100),
    phase: optionalTrimmed(100),
    society: optionalTrimmed(100),
    subSector: optionalTrimmed(100),
    areaLabel: z.string().trim().min(1, "Enter an area label").max(200),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),

    sizeValue: z.coerce.number().positive("Enter a size"),
    sizeUnit: z.enum(["MARLA", "KANAL", "SQFT"]),
    bedrooms: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().positive().optional()),
    bathrooms: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().positive().optional()),

    photos: z.array(photoInputSchema).default([]),

    expiryDate: optionalTrimmed(10),
    sourceRef: optionalTrimmed(300),
    lastCheckedAt: optionalTrimmed(10),
  })
  .superRefine((data, ctx) => {
    if (data.propertyType !== "PLOT") {
      if (!data.bedrooms) {
        ctx.addIssue({ code: "custom", path: ["bedrooms"], message: "Enter the number of bedrooms" });
      }
      if (!data.bathrooms) {
        ctx.addIssue({ code: "custom", path: ["bathrooms"], message: "Enter the number of bathrooms" });
      }
    }
  });

// The *input* (pre-transform/coerce) shape — what react-hook-form's
// register/defaultValues actually deal with. zodResolver validates and
// transforms to the output shape at submit time (see M3's lead forms for
// the same pattern).
export type ListingFormValues = z.input<typeof listingFormSchema>;
