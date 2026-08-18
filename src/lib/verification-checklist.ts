import { z } from "zod";

// §12 / product strategy: trust is earned through this checklist, never
// just assigned. Records that a review happened — stores NO documents.
export const CHECKLIST_ITEMS = [
  {
    key: "eligibility",
    label: "Eligibility",
    description: "Scheme, phase & property type confirmed within an approved area.",
  },
  {
    key: "identity",
    label: "Identity",
    description: "Seller identity checked; relationship to property recorded.",
  },
  {
    key: "authority",
    label: "Authority",
    description: "Signed, time-limited listing mandate & commission (counsel-reviewed).",
  },
  {
    key: "documentReview",
    label: "Document review",
    description:
      "Ownership/transfer docs reviewed against checklist — dBrokerage is NOT issuing title insurance or a legal guarantee. Records that a review happened; stores no document.",
  },
  {
    key: "physicalVisit",
    label: "Physical visit",
    description: "Property visited; address, occupancy, specs & condition confirmed.",
  },
  {
    key: "media",
    label: "Media",
    description: "Professional photos & factsheet captured.",
  },
  {
    key: "availabilityPrice",
    label: "Availability & price",
    description: "Current availability, asking price & viewing process confirmed.",
  },
  {
    key: "publication",
    label: "Publication",
    description: "Ready to publish with verification date & limitation language.",
  },
] as const;

export type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]["key"];

export type VerificationChecklist = Record<ChecklistKey, boolean>;

export const CHECKLIST_KEYS = CHECKLIST_ITEMS.map((i) => i.key) as ChecklistKey[];

export const emptyChecklist: VerificationChecklist = Object.fromEntries(
  CHECKLIST_KEYS.map((k) => [k, false])
) as VerificationChecklist;

const checklistShape = Object.fromEntries(CHECKLIST_KEYS.map((k) => [k, z.boolean()])) as Record<
  ChecklistKey,
  z.ZodBoolean
>;

export const verificationChecklistSchema = z.object(checklistShape);

export function isChecklistComplete(checklist: VerificationChecklist | null | undefined): boolean {
  if (!checklist) return false;
  return CHECKLIST_KEYS.every((k) => checklist[k] === true);
}

/** Normalizes a value read back from the Listing.verificationChecklist Json
 * column (untyped at the DB layer) into a well-formed checklist object. */
export function parseChecklist(value: unknown): VerificationChecklist {
  const parsed = verificationChecklistSchema.partial().safeParse(value);
  if (!parsed.success) return { ...emptyChecklist };
  return { ...emptyChecklist, ...parsed.data };
}
