import type { SizeUnit } from "@prisma/client";

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
