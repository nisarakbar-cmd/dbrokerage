"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BEDROOM_OPTIONS,
  PRICE_BUCKET_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SIZE_BUCKET_OPTIONS,
  ZONE_OPTIONS,
} from "@/lib/filters";
import { cn } from "@/lib/utils";

export interface FilterBarProps {
  className?: string;
}

// Radix Select items can't have an empty string value — use a sentinel for
// "any" and strip it back out when building the URL.
const ANY = "any";

function FilterBarInner({ className }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [zone, setZone] = useState(searchParams.get("zone") ?? ANY);
  const [type, setType] = useState(searchParams.get("type") ?? ANY);
  const [price, setPrice] = useState(searchParams.get("price") ?? ANY);
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") ?? ANY);
  const [size, setSize] = useState(searchParams.get("size") ?? ANY);

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());
    const apply = (key: string, value: string) => {
      if (value === ANY) params.delete(key);
      else params.set(key, value);
    };
    apply("zone", zone);
    apply("type", type);
    apply("price", price);
    apply("bedrooms", bedrooms);
    apply("size", size);

    const query = params.toString();
    router.push(query ? `/buy?${query}` : "/buy", { scroll: false });
  }

  return (
    <div className={cn("flex flex-wrap items-end gap-3 rounded-xl border border-border bg-bg-surface p-4", className)}>
      <Field label="Location">
        <Select value={zone} onValueChange={setZone}>
          <SelectTrigger className="w-full min-w-36 sm:w-auto">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All locations</SelectItem>
            {ZONE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Property type">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full min-w-32 sm:w-auto">
            <SelectValue placeholder="All types" />
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

      <Field label="Price">
        <Select value={price} onValueChange={setPrice}>
          <SelectTrigger className="w-full min-w-32 sm:w-auto">
            <SelectValue placeholder="Any price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any price</SelectItem>
            {PRICE_BUCKET_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Bedrooms">
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger className="w-full min-w-24 sm:w-auto">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any</SelectItem>
            {BEDROOM_OPTIONS.map((n) => (
              <SelectItem key={n} value={n}>
                {n}+
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Size">
        <Select value={size} onValueChange={setSize}>
          <SelectTrigger className="w-full min-w-28 sm:w-auto">
            <SelectValue placeholder="Any size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any size</SelectItem>
            {SIZE_BUCKET_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Button variant="ghost" size="sm" className="text-text-muted">
        <SlidersHorizontal />
        More filters
      </Button>

      <Button variant="primary" size="sm" className="ml-auto" onClick={handleSearch}>
        <Search />
        Search
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-text-muted uppercase">{label}</span>
      {children}
    </div>
  );
}

function FilterBarSkeleton({ className }: FilterBarProps) {
  return <div className={cn("h-[74px] rounded-xl border border-border bg-bg-surface", className)} />;
}

export function FilterBar(props: FilterBarProps) {
  return (
    <Suspense fallback={<FilterBarSkeleton {...props} />}>
      <FilterBarInner {...props} />
    </Suspense>
  );
}
