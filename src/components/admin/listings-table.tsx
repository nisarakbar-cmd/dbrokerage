"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TierBadge } from "@/components/ui/tier-badge";
import { StatusPill } from "@/components/ui/status-pill";
import { PROPERTY_TYPE_OPTIONS } from "@/lib/filters";
import { formatDate, formatPriceRupees } from "@/lib/format";
import type { AdminListingsPage } from "@/lib/admin-listings";
import { archiveListing, publishListing, restoreListing, unpublishListing } from "@/lib/actions/listing-actions";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

const ANY = "any";

const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "UNDER_OFFER", label: "Under Offer" },
  { value: "SOLD", label: "Sold" },
  { value: "WITHDRAWN", label: "Withdrawn" },
] as const;

const TIER_OPTIONS = [
  { value: "VERIFIED_FEATURED", label: "Featured & Verified" },
  { value: "VERIFIED", label: "Verified" },
  { value: "UNVERIFIED", label: "Unverified" },
] as const;

const AVAILABILITY_COLOR: Record<string, string> = {
  AVAILABLE: "var(--success)",
  UNDER_OFFER: "var(--pipeline-negotiation)",
  SOLD: "var(--text-subtle)",
  WITHDRAWN: "var(--pipeline-lost)",
};

function ListingsTableInner({ data }: { data: AdminListingsPage }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [tier, setTier] = useState(searchParams.get("tier") ?? ANY);
  const [availability, setAvailability] = useState(searchParams.get("availability") ?? ANY);
  const [type, setType] = useState(searchParams.get("type") ?? ANY);
  const [published, setPublished] = useState(searchParams.get("published") ?? ANY);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const showArchived = searchParams.get("archived") === "true";

  function pushParams(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === ANY || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/admin/listings?${query}` : "/admin/listings", { scroll: false });
  }

  function applyFilters() {
    pushParams({ tier, availability, type, published, search });
  }

  function toggleArchived() {
    pushParams({ archived: showArchived ? null : "true" });
  }

  function clearFilters() {
    setTier(ANY);
    setAvailability(ANY);
    setType(ANY);
    setPublished(ANY);
    setSearch("");
    router.push("/admin/listings", { scroll: false });
  }

  const hasActiveFilters = ["tier", "availability", "type", "published", "search"].some((k) => searchParams.has(k));

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/admin/listings?${params.toString()}`, { scroll: false });
  }

  function runAction(id: string, action: () => Promise<ActionResult>, successMessage: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) toast.error(result.error);
      else toast.success(successMessage);
      setPendingId(null);
    });
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Type">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full min-w-32 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All types</SelectItem>
              {PROPERTY_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Tier">
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger className="w-full min-w-36 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All tiers</SelectItem>
              {TIER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Availability">
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="w-full min-w-32 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any</SelectItem>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Published">
          <Select value={published} onValueChange={setPublished}>
            <SelectTrigger className="w-full min-w-28 sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any</SelectItem>
              <SelectItem value="true">Published</SelectItem>
              <SelectItem value="false">Unpublished</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Search">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Title, area…"
            className="w-full min-w-48 sm:w-auto"
          />
        </Field>

        <Button variant="primary" size="sm" onClick={applyFilters}>
          Apply
        </Button>

        <Button variant="ghost" size="sm" className="ml-auto text-text-muted" onClick={toggleArchived}>
          {showArchived ? "Hide archived" : "Show archived"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Verified date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.listings.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-text-muted">
                  <p>No listings match these filters.</p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
            {data.listings.map((listing) => {
              const isArchived = !!listing.archivedAt;
              const rowPending = isPending && pendingId === listing.id;
              return (
                <TableRow key={listing.id} className={cn(isArchived && "opacity-60")}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-text">{listing.title}</span>
                      <span className="text-xs text-text-muted">{listing.areaLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-muted">{PROPERTY_TYPE_LABEL[listing.propertyType]}</TableCell>
                  <TableCell className="tabular-nums text-text-muted">{formatPriceRupees(listing.priceRupees)}</TableCell>
                  <TableCell>
                    <TierBadge tier={listing.tier} />
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      color={AVAILABILITY_COLOR[listing.availability]}
                      label={AVAILABILITY_OPTIONS.find((o) => o.value === listing.availability)?.label ?? listing.availability}
                    />
                  </TableCell>
                  <TableCell className="text-text-muted">{listing.published ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-text-muted">
                    {listing.verifiedDate ? formatDate(new Date(listing.verifiedDate)) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/listings/${listing.id}/edit`}>
                        <Button variant="ghost" size="icon-sm" title="Edit" aria-label={`Edit ${listing.title}`}>
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      {!isArchived && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={rowPending}
                          onClick={() =>
                            runAction(
                              listing.id,
                              () => (listing.published ? unpublishListing(listing.id) : publishListing(listing.id)),
                              listing.published ? "Listing unpublished." : "Listing published."
                            )
                          }
                        >
                          {listing.published ? "Unpublish" : "Publish"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={rowPending}
                        onClick={() =>
                          runAction(
                            listing.id,
                            () => (isArchived ? restoreListing(listing.id) : archiveListing(listing.id)),
                            isArchived ? "Listing restored." : "Listing archived."
                          )
                        }
                      >
                        {isArchived ? "Restore" : "Archive"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>
            Page {data.page} of {totalPages} · {data.total} listings
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => goToPage(data.page - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= totalPages}
              onClick={() => goToPage(data.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  PLOT: "Plot",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-text-muted uppercase">{label}</span>
      {children}
    </div>
  );
}

export function ListingsTable({ data }: { data: AdminListingsPage }) {
  return (
    <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-bg-surface" />}>
      <ListingsTableInner data={data} />
    </Suspense>
  );
}
