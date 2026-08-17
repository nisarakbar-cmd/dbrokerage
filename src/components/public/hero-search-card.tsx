"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Home, LandPlot, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRICE_BUCKET_OPTIONS, PROPERTY_TYPE_OPTIONS, ZONE_OPTIONS } from "@/lib/filters";
import { cn } from "@/lib/utils";

const ANY = "any";

const QUICK_TYPES = [
  { value: "HOUSE", label: "House", icon: Home },
  { value: "APARTMENT", label: "Apartment", icon: Building2 },
  { value: "PLOT", label: "Plot", icon: LandPlot },
] as const;

export function HeroSearchCard() {
  const router = useRouter();
  const [zone, setZone] = useState(ANY);
  const [type, setType] = useState(ANY);
  const [price, setPrice] = useState(ANY);

  function buildParams(overrides?: Record<string, string>) {
    const params = new URLSearchParams();
    const values: Record<string, string> = { zone, type, price, ...overrides };
    for (const [key, value] of Object.entries(values)) {
      if (value !== ANY) params.set(key, value);
    }
    return params;
  }

  function handleSearch() {
    const query = buildParams().toString();
    router.push(query ? `/buy?${query}` : "/buy");
  }

  function handleQuickType(propertyType: string) {
    const query = buildParams({ type: propertyType }).toString();
    router.push(`/buy?${query}`);
  }

  return (
    <div className="w-full max-w-3xl rounded-xl border border-border bg-bg-surface p-5 shadow-lg shadow-black/20 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Location" className="flex-1">
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger className="w-full">
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

        <Field label="Property type" className="flex-1">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full">
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

        <Field label="Price range" className="flex-1">
          <Select value={price} onValueChange={setPrice}>
            <SelectTrigger className="w-full">
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

        <Button variant="primary" onClick={handleSearch} className="sm:w-auto">
          <Search />
          Search
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium tracking-wide text-text-muted uppercase">Quick look</span>
        {QUICK_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleQuickType(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-text-muted transition-colors motion-reduce:transition-none hover:border-primary/40 hover:text-text"
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium tracking-wide text-text-muted uppercase">{label}</span>
      {children}
    </div>
  );
}
