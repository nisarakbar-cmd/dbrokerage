"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { optionalEmailSchema, phoneSchema } from "@/lib/validation";
import { useOtpFlow } from "@/components/public/lead-capture/use-otp-flow";
import { OtpCodeStep } from "@/components/public/lead-capture/otp-code-step";
import { SuccessStep } from "@/components/public/lead-capture/success-step";
import { HoneypotField } from "@/components/public/lead-capture/honeypot-field";
import { FormField } from "@/components/public/lead-capture/form-field";

const formSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: phoneSchema,
  email: optionalEmailSchema,
  honeypot: z.string().optional(),
});

type FormValues = z.input<typeof formSchema>;

export interface MarketUpdatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketUpdatesDialog({ open, onOpenChange }: MarketUpdatesDialogProps) {
  const otp = useOtpFlow();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "", email: "", honeypot: "" },
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      otp.reset();
      form.reset();
    }
    onOpenChange(next);
  }

  function onSubmit(values: FormValues) {
    void otp.submitDetails(
      values.phone,
      {
        name: values.name,
        email: values.email,
        source: "MARKET_UPDATES",
        propertyInterest: "Islamabad residential",
      },
      values.honeypot ?? ""
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{otp.step === "success" ? "You're signed up" : "Sign up for market updates"}</DialogTitle>
          {otp.step === "details" && (
            <DialogDescription>
              Phone-verified — no account, no password. Just occasional updates on Islamabad &amp; Rawalpindi listings.
            </DialogDescription>
          )}
        </DialogHeader>

        {otp.step === "details" && (
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

            <HoneypotField {...form.register("honeypot")} />

            {otp.error && <p className="text-sm text-destructive">{otp.error}</p>}

            <Button type="submit" variant="primary" disabled={otp.loading} className="w-full">
              {otp.loading ? "Sending…" : "Sign Up"}
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
            title="You're signed up"
            message="We'll send you market updates for Islamabad & Rawalpindi."
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
