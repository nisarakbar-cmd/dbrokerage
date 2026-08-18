"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_OPTIONS } from "@/lib/filters";
import { optionalEmailSchema, optionalMessageSchema, phoneSchema } from "@/lib/validation";
import { useOtpFlow } from "@/components/public/lead-capture/use-otp-flow";
import { OtpCodeStep } from "@/components/public/lead-capture/otp-code-step";
import { SuccessStep } from "@/components/public/lead-capture/success-step";
import { HoneypotField } from "@/components/public/lead-capture/honeypot-field";
import { FormField } from "@/components/public/lead-capture/form-field";

const PROPERTY_TYPE_LABEL = Object.fromEntries(PROPERTY_TYPE_OPTIONS.map((o) => [o.value, o.label]));

const SIZE_UNIT_OPTIONS = [
  { value: "MARLA", label: "Marla" },
  { value: "KANAL", label: "Kanal" },
  { value: "SQFT", label: "Sq Ft" },
] as const;
const SIZE_UNIT_LABEL = Object.fromEntries(SIZE_UNIT_OPTIONS.map((o) => [o.value, o.label]));

const estimatorSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  propertyType: z.enum(["HOUSE", "APARTMENT", "PLOT"], { message: "Choose a property type" }),
  location: z.string().trim().min(2, "Enter the property's location"),
  sizeValue: z.coerce.number().positive("Enter the property size"),
  sizeUnit: z.enum(["MARLA", "KANAL", "SQFT"], { message: "Choose a unit" }),
  bedrooms: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().int().positive().optional()
  ),
  notes: optionalMessageSchema,
  honeypot: z.string().optional(),
});

type FormValues = z.input<typeof estimatorSchema>;

export function HomeEstimatorForm() {
  const otp = useOtpFlow();

  const form = useForm<FormValues>({
    resolver: zodResolver(estimatorSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      location: "",
      sizeValue: "" as unknown as number,
      bedrooms: "",
      notes: "",
      honeypot: "",
    },
  });

  const propertyType = form.watch("propertyType");
  const isPlot = propertyType === "PLOT";

  function onSubmit(values: FormValues) {
    const propertyInterest = `${PROPERTY_TYPE_LABEL[values.propertyType]} in ${values.location}`;
    const parts = [`Size: ${values.sizeValue} ${SIZE_UNIT_LABEL[values.sizeUnit]}`];
    if (!isPlot && values.bedrooms) parts.push(`Bedrooms: ${values.bedrooms}`);
    if (values.notes) parts.push(values.notes);

    void otp.submitDetails(
      values.phone,
      {
        name: values.name,
        email: values.email,
        message: parts.join(". "),
        source: "HOME_ESTIMATOR",
        propertyInterest,
      },
      values.honeypot ?? ""
    );
  }

  if (otp.step === "code") {
    return (
      <OtpCodeStep
        phone={otp.phone}
        loading={otp.loading}
        error={otp.error}
        resendCooldown={otp.resendCooldown}
        onSubmit={(code) => void otp.submitCode(code)}
        onResend={() => void otp.resend()}
        onBack={otp.backToDetails}
      />
    );
  }

  if (otp.step === "success") {
    return (
      <SuccessStep
        title="Estimate requested"
        message="A dBrokerage agent will follow up with a home estimate soon."
      />
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField label="Full name" error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} placeholder="Your name" autoComplete="name" />
      </FormField>

      <FormField label="Phone number" error={form.formState.errors.phone?.message}>
        <Input {...form.register("phone")} placeholder="0300 1234567" autoComplete="tel" inputMode="tel" />
      </FormField>

      <FormField label="Email (optional)" error={form.formState.errors.email?.message}>
        <Input {...form.register("email")} type="email" placeholder="you@example.com" autoComplete="email" />
      </FormField>

      <FormField label="Property type" error={form.formState.errors.propertyType?.message}>
        <Select
          value={form.watch("propertyType") ?? ""}
          onValueChange={(v) => form.setValue("propertyType", v as FormValues["propertyType"], { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Location" error={form.formState.errors.location?.message}>
        <Input {...form.register("location")} placeholder="e.g. Bahria Town Phase 7" />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Size" error={form.formState.errors.sizeValue?.message}>
          <Input {...form.register("sizeValue")} type="number" min="0" step="any" placeholder="10" />
        </FormField>
        <FormField label="Unit" error={form.formState.errors.sizeUnit?.message}>
          <Select
            value={form.watch("sizeUnit") ?? ""}
            onValueChange={(v) => form.setValue("sizeUnit", v as FormValues["sizeUnit"], { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_UNIT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {!isPlot && (
        <FormField label="Bedrooms (optional)" error={form.formState.errors.bedrooms?.message}>
          <Input {...form.register("bedrooms")} type="number" min="0" step="1" placeholder="4" />
        </FormField>
      )}

      <FormField label="Notes (optional)" error={form.formState.errors.notes?.message}>
        <textarea
          {...form.register("notes")}
          rows={3}
          placeholder="Condition, recent renovations, anything else worth knowing…"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </FormField>

      <HoneypotField {...form.register("honeypot")} />

      {otp.error && <p className="text-sm text-destructive">{otp.error}</p>}

      <Button type="submit" variant="primary" disabled={otp.loading} className="w-full">
        {otp.loading ? "Sending…" : "Request an estimate"}
      </Button>
    </form>
  );
}
