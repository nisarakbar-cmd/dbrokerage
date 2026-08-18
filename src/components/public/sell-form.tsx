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

const sellSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  propertyType: z.enum(["HOUSE", "APARTMENT", "PLOT"], { message: "Choose a property type" }),
  location: z.string().trim().min(2, "Enter the property's location"),
  notes: optionalMessageSchema,
  honeypot: z.string().optional(),
});

type FormValues = z.input<typeof sellSchema>;

export function SellForm() {
  const otp = useOtpFlow();

  const form = useForm<FormValues>({
    resolver: zodResolver(sellSchema),
    defaultValues: { name: "", phone: "", email: "", location: "", notes: "", honeypot: "" },
  });

  function onSubmit(values: FormValues) {
    const propertyInterest = `${PROPERTY_TYPE_LABEL[values.propertyType]} in ${values.location}`;
    void otp.submitDetails(
      values.phone,
      {
        name: values.name,
        email: values.email,
        message: values.notes,
        source: "SELL",
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
        title="We've got your details"
        message="A dBrokerage agent will be in touch about selling your property."
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
        <Input {...form.register("location")} placeholder="e.g. DHA Phase 2, Islamabad" />
      </FormField>

      <FormField label="Notes (optional)" error={form.formState.errors.notes?.message}>
        <textarea
          {...form.register("notes")}
          rows={3}
          placeholder="Anything else worth knowing — size, condition, timeline…"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </FormField>

      <HoneypotField {...form.register("honeypot")} />

      {otp.error && <p className="text-sm text-destructive">{otp.error}</p>}

      <Button type="submit" variant="primary" disabled={otp.loading} className="w-full">
        {otp.loading ? "Sending…" : "Get started"}
      </Button>
    </form>
  );
}
