"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { LeadStatus } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/public/lead-capture/form-field";
import { LEAD_SOURCE_LABEL, LEAD_SOURCE_VALUES, LEAD_STATUS_VALUES, STATUS_LABEL } from "@/lib/pipeline";
import { createManualLead } from "@/lib/actions/lead-actions";

const NO_LISTING = "none";
const UNASSIGNED = "unassigned";

const formSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the lead's name"),
    phone: z.string().trim().min(1, "Enter a phone number"),
    source: z.enum(LEAD_SOURCE_VALUES as [string, ...string[]]),
    listingId: z.string(),
    propertyInterest: z.string().trim().optional(),
    email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
    message: z.string().trim().optional(),
    status: z.enum(LEAD_STATUS_VALUES as [string, ...string[]]),
    agentId: z.string(),
  })
  .refine((data) => data.listingId !== NO_LISTING || !!data.propertyInterest?.trim(), {
    message: "Describe their property interest",
    path: ["propertyInterest"],
  });

type FormValues = z.infer<typeof formSchema>;

export interface NewLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: { id: string; name: string }[];
  listings: { id: string; title: string; areaLabel: string }[];
}

export function NewLeadDialog({ open, onOpenChange, agents, listings }: NewLeadDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      source: "CONTACT_AGENT",
      listingId: NO_LISTING,
      propertyInterest: "",
      email: "",
      message: "",
      status: "NEW",
      agentId: UNASSIGNED,
    },
  });

  const listingId = form.watch("listingId");

  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    onOpenChange(next);
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const result = await createManualLead({
      name: values.name,
      phone: values.phone,
      source: values.source,
      listingId: values.listingId === NO_LISTING ? undefined : values.listingId,
      propertyInterest: values.listingId === NO_LISTING ? values.propertyInterest : undefined,
      email: values.email,
      message: values.message,
      status: values.status as LeadStatus,
      assignedAgentId: values.agentId === UNASSIGNED ? undefined : values.agentId,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(`Lead created for ${values.name}.`);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
          <DialogDescription>
            Manually adding a lead does not phone-verify them — this stays unverified until they
            complete the OTP flow themselves.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-1">
          <FormField label="Name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder="Full name" />
          </FormField>

          <FormField label="Phone" error={form.formState.errors.phone?.message}>
            <Input {...form.register("phone")} placeholder="0300 1234567" inputMode="tel" />
          </FormField>

          <FormField label="Source" error={form.formState.errors.source?.message}>
            <Select
              value={form.watch("source")}
              onValueChange={(v) => form.setValue("source", v, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCE_VALUES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LEAD_SOURCE_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Listing">
            <Select
              value={listingId}
              onValueChange={(v) => form.setValue("listingId", v, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LISTING}>No specific listing</SelectItem>
                {listings.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.title} — {l.areaLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {listingId === NO_LISTING && (
            <FormField label="Property interest" error={form.formState.errors.propertyInterest?.message}>
              <Input {...form.register("propertyInterest")} placeholder="e.g. Islamabad residential" />
            </FormField>
          )}

          <FormField label="Email (optional)" error={form.formState.errors.email?.message}>
            <Input {...form.register("email")} type="email" placeholder="you@example.com" />
          </FormField>

          <FormField label="Message (optional)">
            <textarea
              {...form.register("message")}
              rows={2}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Initial status">
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUS_VALUES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Agent (optional)">
              <Select
                value={form.watch("agentId")}
                onValueChange={(v) => form.setValue("agentId", v, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <p className="rounded-lg border border-border bg-bg-elevated p-3 text-xs text-text-muted">
            This lead will be marked as not phone-verified.
          </p>

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? "Creating…" : "Create lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
