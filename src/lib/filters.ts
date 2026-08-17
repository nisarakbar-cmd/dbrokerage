// Shared filter-bucket definitions for /buy + HeroSearchCard — the URL
// carries a bucket key (e.g. price=1cr-5cr), and the server query builder
// (lib/listings.ts) resolves it to a min/max range. One source of truth
// keeps the UI's displayed value and the DB query's range in sync.

export const PRICE_BUCKETS = {
  "under-50l": { priceMin: undefined, priceMax: 5_000_000 },
  "50l-1cr": { priceMin: 5_000_000, priceMax: 10_000_000 },
  "1cr-5cr": { priceMin: 10_000_000, priceMax: 50_000_000 },
  "5cr-plus": { priceMin: 50_000_000, priceMax: undefined },
} as const;

export type PriceBucket = keyof typeof PRICE_BUCKETS;

export const PRICE_BUCKET_OPTIONS: { value: PriceBucket; label: string }[] = [
  { value: "under-50l", label: "Under 50 Lakh" },
  { value: "50l-1cr", label: "50 Lakh – 1 Crore" },
  { value: "1cr-5cr", label: "1 – 5 Crore" },
  { value: "5cr-plus", label: "5 Crore+" },
];

const MARLA = 272.25;
const KANAL = 5445;

export const SIZE_BUCKETS = {
  "up-to-5-marla": { sizeMin: undefined, sizeMax: 5 * MARLA },
  "5-10-marla": { sizeMin: 5 * MARLA, sizeMax: 10 * MARLA },
  "10-marla-1-kanal": { sizeMin: 10 * MARLA, sizeMax: KANAL },
  "1-kanal-plus": { sizeMin: KANAL, sizeMax: undefined },
} as const;

export type SizeBucket = keyof typeof SIZE_BUCKETS;

export const SIZE_BUCKET_OPTIONS: { value: SizeBucket; label: string }[] = [
  { value: "up-to-5-marla", label: "Up to 5 Marla" },
  { value: "5-10-marla", label: "5 – 10 Marla" },
  { value: "10-marla-1-kanal", label: "10 Marla – 1 Kanal" },
  { value: "1-kanal-plus", label: "1 Kanal+" },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: "HOUSE", label: "House" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "PLOT", label: "Plot" },
] as const;

export const ZONE_OPTIONS = [
  { value: "CDA", label: "CDA" },
  { value: "DHA", label: "DHA" },
  { value: "BAHRIA_TOWN", label: "Bahria Town" },
  { value: "BAHRIA_ENCLAVE", label: "Bahria Enclave" },
] as const;

export const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5"] as const;

export function isPriceBucket(value: string): value is PriceBucket {
  return value in PRICE_BUCKETS;
}

export function isSizeBucket(value: string): value is SizeBucket {
  return value in SIZE_BUCKETS;
}
