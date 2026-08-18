"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Availability, ListingTier } from "@prisma/client";
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
import { PhotoEditor } from "@/components/admin/photo-editor";
import { VerificationChecklistSection } from "@/components/admin/verification-checklist-section";
import { PROPERTY_TYPE_OPTIONS } from "@/lib/filters";
import { formatPriceRupees } from "@/lib/format";
import { listingFormSchema, type ListingFormValues } from "@/lib/listing-schema";
import { emptyChecklist, isChecklistComplete, type VerificationChecklist } from "@/lib/verification-checklist";
import type { ListingEditData } from "@/lib/admin-listings";
import {
  createListing,
  publishListing,
  setAvailability,
  setListingTier,
  setVerificationChecklist,
  unpublishListing,
  updateListing,
} from "@/lib/actions/listing-actions";

const ZONE_OPTIONS = [
  { value: "CDA", label: "CDA" },
  { value: "DHA", label: "DHA" },
  { value: "BAHRIA_TOWN", label: "Bahria Town" },
  { value: "BAHRIA_ENCLAVE", label: "Bahria Enclave" },
  { value: "PRIVATE_SCHEME", label: "Private Scheme" },
] as const;

const SIZE_UNIT_OPTIONS = [
  { value: "MARLA", label: "Marla" },
  { value: "KANAL", label: "Kanal" },
  { value: "SQFT", label: "Sq Ft" },
] as const;

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "UNDER_OFFER", label: "Under Offer" },
  { value: "SOLD", label: "Sold" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

const TIER_OPTIONS: { value: ListingTier; label: string }[] = [
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "VERIFIED", label: "Verified" },
  { value: "VERIFIED_FEATURED", label: "Featured & Verified" },
];

export interface ListingFormProps {
  mode: "create" | "edit";
  initialData?: ListingEditData;
}

export function ListingForm({ mode, initialData }: ListingFormProps) {
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug,
      description: initialData?.description ?? "",
      propertyType: initialData?.propertyType ?? "HOUSE",
      priceCrore: initialData?.priceCrore ?? ("" as unknown as number),
      city: initialData?.city ?? "Islamabad",
      zone: initialData?.zone ?? "CDA",
      sector: initialData?.sector ?? "",
      phase: initialData?.phase ?? "",
      society: initialData?.society ?? "",
      subSector: initialData?.subSector ?? "",
      areaLabel: initialData?.areaLabel ?? "",
      lat: initialData?.lat ?? undefined,
      lng: initialData?.lng ?? undefined,
      sizeValue: initialData?.sizeValue ?? ("" as unknown as number),
      sizeUnit: initialData?.sizeUnit ?? "MARLA",
      bedrooms: initialData?.bedrooms ?? undefined,
      bathrooms: initialData?.bathrooms ?? undefined,
      photos: initialData?.photos.map((p) => ({ url: p.url, alt: p.alt ?? undefined })) ?? [],
      expiryDate: initialData?.expiryDate ?? "",
      sourceRef: initialData?.sourceRef ?? "",
      lastCheckedAt: initialData?.lastCheckedAt ?? "",
    },
  });

  const photoFieldArray = useFieldArray({ control: form.control, name: "photos" });
  const propertyType = form.watch("propertyType");
  const priceCrore = form.watch("priceCrore");
  const isPlot = propertyType === "PLOT";
  const previewPrice =
    typeof priceCrore === "number" && priceCrore > 0 ? formatPriceRupees(Math.round(priceCrore * 10_000_000)) : null;

  async function onSubmit(values: ListingFormValues) {
    setSaveError(null);
    if (mode === "create") {
      const result = await createListing(values);
      if (!result.ok) {
        setSaveError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Listing created.");
      router.push(`/admin/listings/${result.id}/edit`);
    } else if (initialData) {
      const result = await updateListing(initialData.id, values);
      if (!result.ok) {
        setSaveError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Changes saved.");
      router.refresh();
    }
  }

  // Edit-only quick-action state — tier/checklist/publish/availability each
  // save immediately via their own Server Action (matching the M4 LeadDrawer
  // pattern), independent of the main "Save changes" button below.
  const [tier, setTier] = useState<ListingTier>(initialData?.tier ?? "UNVERIFIED");
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [availability, setAvailabilityState] = useState<Availability>(initialData?.availability ?? "AVAILABLE");
  const [checklist, setChecklistState] = useState<VerificationChecklist>(
    initialData?.verificationChecklist ?? emptyChecklist
  );
  const [verifiedDate, setVerifiedDate] = useState<string | null>(initialData?.verifiedDate ?? null);
  const [verifiedBy, setVerifiedBy] = useState<string | null>(initialData?.verifiedBy ?? null);
  const [isPending, startTransition] = useTransition();

  function handleTierChange(next: string) {
    if (!initialData) return;
    startTransition(async () => {
      const result = await setListingTier(initialData.id, next as ListingTier);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Tier updated.");
      setTier(next as ListingTier);
    });
  }

  function handleSaveChecklist() {
    if (!initialData) return;
    const complete = isChecklistComplete(checklist);
    startTransition(async () => {
      const result = await setVerificationChecklist(initialData.id, checklist);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(complete ? "Verification checklist completed." : "Checklist saved.");
      if (complete) {
        setVerifiedDate((d) => d ?? new Date().toISOString());
      } else {
        setVerifiedDate(null);
        setVerifiedBy(null);
        if (tier !== "UNVERIFIED") setTier("UNVERIFIED"); // mirrors the action's auto-downgrade
      }
    });
  }

  function handleTogglePublish() {
    if (!initialData) return;
    startTransition(async () => {
      const result = published ? await unpublishListing(initialData.id) : await publishListing(initialData.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(published ? "Listing unpublished." : "Listing published.");
      setPublished((v) => !v);
    });
  }

  function handleAvailabilityChange(next: string) {
    if (!initialData) return;
    startTransition(async () => {
      const result = await setAvailability(initialData.id, next as Availability);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Availability updated.");
      setAvailabilityState(next as Availability);
    });
  }

  const checklistComplete = isChecklistComplete(checklist);
  const showSourceFields = mode === "create" || tier === "UNVERIFIED";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 pb-16">
      <Section title="Basics">
        <FormField label="Title" error={form.formState.errors.title?.message}>
          <Input {...form.register("title")} placeholder="5-Bedroom House in DHA Phase 2" />
        </FormField>

        {mode === "edit" && (
          <FormField label="Slug" error={form.formState.errors.slug?.message}>
            <Input {...form.register("slug")} placeholder="dha-phase-2-house" />
          </FormField>
        )}

        <FormField label="Description" error={form.formState.errors.description?.message}>
          <textarea
            {...form.register("description")}
            rows={4}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </FormField>

        <FormField label="Property type" error={form.formState.errors.propertyType?.message}>
          <Select
            value={form.watch("propertyType")}
            onValueChange={(v) => form.setValue("propertyType", v as ListingFormValues["propertyType"], { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
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
      </Section>

      <Section title="Price">
        <FormField label="Price (Crore)" error={form.formState.errors.priceCrore?.message}>
          <Input {...form.register("priceCrore")} type="number" step="any" min="0" placeholder="8.75" />
        </FormField>
        {previewPrice && <p className="text-sm text-text-muted">{previewPrice}</p>}
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" error={form.formState.errors.city?.message}>
            <Input {...form.register("city")} />
          </FormField>
          <FormField label="Zone" error={form.formState.errors.zone?.message}>
            <Select
              value={form.watch("zone")}
              onValueChange={(v) => form.setValue("zone", v as ListingFormValues["zone"], { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZONE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sector (CDA)">
            <Input {...form.register("sector")} placeholder="e.g. F-11" />
          </FormField>
          <FormField label="Phase (DHA / Bahria)">
            <Input {...form.register("phase")} placeholder="e.g. Phase 2" />
          </FormField>
          <FormField label="Society (Private Scheme)">
            <Input {...form.register("society")} />
          </FormField>
          <FormField label="Sub-sector">
            <Input {...form.register("subSector")} placeholder="e.g. F-11/1" />
          </FormField>
        </div>

        <FormField label="Area label" error={form.formState.errors.areaLabel?.message}>
          <Input {...form.register("areaLabel")} placeholder="DHA Phase 2, Islamabad" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Latitude (optional)">
            <Input {...form.register("lat")} type="number" step="any" />
          </FormField>
          <FormField label="Longitude (optional)">
            <Input {...form.register("lng")} type="number" step="any" />
          </FormField>
        </div>
      </Section>

      <Section title="Specs">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Size" error={form.formState.errors.sizeValue?.message}>
            <Input {...form.register("sizeValue")} type="number" step="any" min="0" placeholder="10" />
          </FormField>
          <FormField label="Size unit" error={form.formState.errors.sizeUnit?.message}>
            <Select
              value={form.watch("sizeUnit")}
              onValueChange={(v) => form.setValue("sizeUnit", v as ListingFormValues["sizeUnit"], { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Bedrooms" error={form.formState.errors.bedrooms?.message}>
              <Input {...form.register("bedrooms")} type="number" min="0" step="1" />
            </FormField>
            <FormField label="Bathrooms" error={form.formState.errors.bathrooms?.message}>
              <Input {...form.register("bathrooms")} type="number" min="0" step="1" />
            </FormField>
          </div>
        )}
      </Section>

      <Section title="Photos">
        <PhotoEditor fieldArray={photoFieldArray} register={form.register} watch={form.watch} />
      </Section>

      {showSourceFields && (
        <Section title="Source (unverified only)">
          <FormField label="Source reference">
            <Input {...form.register("sourceRef")} placeholder="Zameen.com listing, referral, etc." />
          </FormField>
          <FormField label="Last checked">
            <Input {...form.register("lastCheckedAt")} type="date" />
          </FormField>
        </Section>
      )}

      <p className="rounded-lg border border-border bg-bg-elevated p-3 text-xs text-text-muted">
        Verification checklist data only. Do not upload ownership documents.
      </p>

      {mode === "edit" && initialData && (
        <>
          <Section title="Tier">
            <FormField label="Listing tier">
              <Select value={tier} onValueChange={handleTierChange} disabled={isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} disabled={opt.value !== "UNVERIFIED" && !checklistComplete}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            {!checklistComplete && (
              <p className="text-xs text-text-muted">
                Complete the verification checklist below to unlock Verified tiers.
              </p>
            )}
          </Section>

          <Section title="Verification checklist">
            <VerificationChecklistSection
              checklist={checklist}
              onChange={setChecklistState}
              onSave={handleSaveChecklist}
              saving={isPending}
              verifiedDate={verifiedDate}
              verifiedBy={verifiedBy}
            />
          </Section>

          <Section title="Availability & publishing">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Availability">
                <Select value={availability} onValueChange={handleAvailabilityChange} disabled={isPending}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text">Published</span>
                <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleTogglePublish}>
                  {published ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </div>

            <FormField label="Manual expiry date (optional)">
              <Input {...form.register("expiryDate")} type="date" />
            </FormField>
          </Section>
        </>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : mode === "create" ? "Create listing" : "Save changes"}
        </Button>
        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-5">
      <h2 className="text-sm font-semibold tracking-wide text-text uppercase">{title}</h2>
      {children}
    </section>
  );
}
