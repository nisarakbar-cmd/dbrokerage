import type { LeadSource, LeadStatus } from "@prisma/client";

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  REQUEST_VIEWING: "Request Viewing",
  CONTACT_AGENT: "Contact Agent",
  SELL: "Sell",
  HOME_ESTIMATOR: "Home Estimator",
  MARKET_UPDATES: "Market Updates",
};

export const LEAD_SOURCE_VALUES: LeadSource[] = [
  "REQUEST_VIEWING",
  "CONTACT_AGENT",
  "SELL",
  "HOME_ESTIMATOR",
  "MARKET_UPDATES",
];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  VIEWING_REQUESTED: "Viewing Requested",
  VIEWING_SCHEDULED: "Viewing Scheduled",
  NEGOTIATION: "Negotiation",
  CLOSED: "Closed",
  LOST: "Lost",
};

// §3 pipeline stage colors, referenced by CSS var so nothing here hardcodes a hex.
export const STATUS_COLOR: Record<LeadStatus, string> = {
  NEW: "var(--pipeline-new)",
  CONTACTED: "var(--pipeline-contacted)",
  QUALIFIED: "var(--pipeline-qualified)",
  VIEWING_REQUESTED: "var(--pipeline-viewing)",
  VIEWING_SCHEDULED: "var(--pipeline-viewing)",
  NEGOTIATION: "var(--pipeline-negotiation)",
  CLOSED: "var(--pipeline-closed)",
  LOST: "var(--pipeline-lost)",
};

export const LEAD_STATUS_VALUES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "VIEWING_REQUESTED",
  "VIEWING_SCHEDULED",
  "NEGOTIATION",
  "CLOSED",
  "LOST",
];

export type PipelineColumnKey =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "VIEWING"
  | "NEGOTIATION"
  | "CLOSED"
  | "LOST";

// The LeadStatus enum has 8 values; the board has 7 columns —
// VIEWING_REQUESTED and VIEWING_SCHEDULED share one column.
export const PIPELINE_COLUMNS: { key: PipelineColumnKey; label: string; color: string }[] = [
  { key: "NEW", label: "New", color: STATUS_COLOR.NEW },
  { key: "CONTACTED", label: "Contacted", color: STATUS_COLOR.CONTACTED },
  { key: "QUALIFIED", label: "Qualified", color: STATUS_COLOR.QUALIFIED },
  { key: "VIEWING", label: "Viewing Requested / Scheduled", color: STATUS_COLOR.VIEWING_REQUESTED },
  { key: "NEGOTIATION", label: "Negotiation", color: STATUS_COLOR.NEGOTIATION },
  { key: "CLOSED", label: "Closed", color: STATUS_COLOR.CLOSED },
  { key: "LOST", label: "Lost", color: STATUS_COLOR.LOST },
];

export type PipelineCounts = Record<PipelineColumnKey, number>;
