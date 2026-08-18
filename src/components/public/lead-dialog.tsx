"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/ui/icons";
import { optionalEmailSchema, optionalMessageSchema, phoneSchema } from "@/lib/validation";
import { useOtpFlow } from "@/components/public/lead-capture/use-otp-flow";
import { OtpCodeStep } from "@/components/public/lead-capture/otp-code-step";
import { SuccessStep } from "@/components/public/lead-capture/success-step";
import { HoneypotField } from "@/components/public/lead-capture/honeypot-field";
import { ListingContextCard, type ListingContext } from "@/components/public/lead-capture/listing-context-card";
import { FormField } from "@/components/public/lead-capture/form-field";

const formSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  message: optionalMessageSchema,
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  honeypot: z.string().optional(),
});

type FormValues = z.input<typeof formSchema>;

export interface LeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: "REQUEST_VIEWING" | "CONTACT_AGENT";
  listing?: ListingContext;
  defaultMessage?: string;
  title?: string;
  submitLabel?: string;
  /** Which reserved action color this dialog's submit button uses.
   * Defaults from `source`, but the unverified "ask to verify" CTA passes
   * "primary" — it must never borrow the reserved viewing/contact colors
   * (§12 tier integrity), even though it still creates a CONTACT_AGENT lead. */
  ctaVariant?: "viewing" | "contact" | "primary";
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function LeadDialog({
  open,
  onOpenChange,
  source,
  listing,
  defaultMessage,
  title,
  submitLabel: submitLabelProp,
  ctaVariant,
}: LeadDialogProps) {
  const otp = useOtpFlow();
  const isViewing = source === "REQUEST_VIEWING";
  const variant = ctaVariant ?? (isViewing ? "viewing" : "contact");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: defaultMessage ?? "",
      preferredDate: "",
      preferredTime: "",
      honeypot: "",
    },
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      otp.reset();
      form.reset();
    }
    onOpenChange(next);
  }

  function onSubmit(values: FormValues) {
    const preferredTime =
      isViewing && values.preferredDate && values.preferredTime
        ? new Date(`${values.preferredDate}T${values.preferredTime}`).toISOString()
        : undefined;

    void otp.submitDetails(
      values.phone,
      {
        name: values.name,
        email: values.email,
        message: values.message,
        source,
        listingId: listing?.id,
        preferredTime,
      },
      values.honeypot ?? ""
    );
  }

  const dialogTitle = title ?? (isViewing ? "Request a Viewing" : "Contact Agent");
  const submitLabel = submitLabelProp ?? (isViewing ? "Request a Viewing" : "Contact Agent");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {otp.step === "success"
              ? isViewing
                ? "Viewing requested"
                : "Message sent"
              : dialogTitle}
          </DialogTitle>
        </DialogHeader>

        {otp.step === "details" && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {listing && <ListingContextCard listing={listing} />}

            <FormField label="Full name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Your name" autoComplete="name" />
            </FormField>

            <FormField label="Phone number" error={form.formState.errors.phone?.message}>
              <Input {...form.register("phone")} placeholder="0300 1234567" autoComplete="tel" inputMode="tel" />
            </FormField>

            <FormField label="Email (optional)" error={form.formState.errors.email?.message}>
              <Input {...form.register("email")} type="email" placeholder="you@example.com" autoComplete="email" />
            </FormField>

            {isViewing && (
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Preferred date">
                  <Input type="date" min={todayIso()} required {...form.register("preferredDate")} />
                </FormField>
                <FormField label="Preferred time">
                  <Input type="time" required {...form.register("preferredTime")} />
                </FormField>
              </div>
            )}

            <FormField label="Message (optional)" error={form.formState.errors.message?.message}>
              <textarea
                {...form.register("message")}
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </FormField>

            <HoneypotField {...form.register("honeypot")} />

            {otp.error && <p className="text-sm text-destructive">{otp.error}</p>}

            <Button type="submit" variant={variant} disabled={otp.loading} className="w-full">
              {isViewing && <Calendar />}
              {variant === "contact" && <WhatsAppIcon />}
              {otp.loading ? "Sending…" : submitLabel}
            </Button>
          </form>
        )}

        {otp.step === "code" && (
          <OtpCodeStep
            phone={otp.phone}
            loading={otp.loading}
            error={otp.error}
            resendCooldown={otp.resendCooldown}
            onSubmit={(code) => void otp.submitCode(code)}
            onResend={() => void otp.resend()}
            onBack={otp.backToDetails}
          />
        )}

        {otp.step === "success" && (
          <SuccessStep
            title={isViewing ? "Viewing requested" : "Message sent"}
            message={
              isViewing
                ? "We've received your request — a dBrokerage agent will confirm your viewing time shortly."
                : "A dBrokerage agent will get back to you shortly."
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
