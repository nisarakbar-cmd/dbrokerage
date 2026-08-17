import type { Availability, SizeUnit } from "@prisma/client";

const CRORE = 10_000_000;
const LAKH = 100_000;

/** Formats rupees as PKR Crore/Lakh, e.g. 87_500_000 -> "PKR 8.75 Crore". */
export function formatPriceRupees(rupees: bigint | number): string {
  const value = typeof rupees === "bigint" ? Number(rupees) : rupees;

  if (value >= CRORE) {
    return `PKR ${(value / CRORE).toFixed(2)} Crore`;
  }
  if (value >= LAKH) {
    return `PKR ${(value / LAKH).toFixed(2)} Lakh`;
  }
  return `PKR ${value.toLocaleString("en-PK")}`;
}

const SIZE_UNIT_LABEL: Record<SizeUnit, string> = {
  MARLA: "Marla",
  KANAL: "Kanal",
  SQFT: "sq ft",
};

/** Formats a plot/covered size, e.g. (1, "KANAL") -> "1 Kanal". */
export function formatSize(value: number, unit: SizeUnit): string {
  const formattedValue = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2);
  return `${formattedValue} ${SIZE_UNIT_LABEL[unit]}`;
}

/** Formats a date for display, e.g. "12 Aug 2026". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Lives here (not in the "use client" property-card.tsx) so Server
// Components can index into it directly — an object exported from a
// client module becomes an opaque client reference when imported into a
// Server Component, so an object literal exported from a client component
// module is present only for that component's own client-side use.
export const AVAILABILITY_LABEL: Record<Exclude<Availability, "AVAILABLE">, string> = {
  UNDER_OFFER: "Under Offer",
  SOLD: "Sold",
  WITHDRAWN: "Withdrawn",
};

const SQFT_PER_MARLA = 272.25;
const SQFT_PER_KANAL = 5445;

/** Normalizes a mixed-unit size to sqft, for range comparisons across listings. */
export function sizeToSqft(value: number, unit: SizeUnit): number {
  switch (unit) {
    case "MARLA":
      return value * SQFT_PER_MARLA;
    case "KANAL":
      return value * SQFT_PER_KANAL;
    case "SQFT":
      return value;
  }
}
