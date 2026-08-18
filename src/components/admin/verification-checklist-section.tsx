"use client";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { CHECKLIST_ITEMS, isChecklistComplete, type VerificationChecklist } from "@/lib/verification-checklist";
import { cn } from "@/lib/utils";

export interface VerificationChecklistSectionProps {
  checklist: VerificationChecklist;
  onChange: (next: VerificationChecklist) => void;
  onSave: () => void;
  saving: boolean;
  verifiedDate: string | null;
  verifiedBy: string | null;
}

export function VerificationChecklistSection({
  checklist,
  onChange,
  onSave,
  saving,
  verifiedDate,
  verifiedBy,
}: VerificationChecklistSectionProps) {
  const complete = isChecklistComplete(checklist);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "rounded-lg border p-3 text-sm",
          complete ? "border-success/30 bg-success/10 text-success" : "border-border bg-bg-elevated text-text-muted"
        )}
      >
        {complete ? (
          <span>
            Complete — verified {verifiedDate ? formatDate(new Date(verifiedDate)) : ""}
            {verifiedBy ? ` by ${verifiedBy}` : ""}.
          </span>
        ) : (
          <span>All items must be checked before a verified tier can be set.</span>
        )}
      </div>

      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {CHECKLIST_ITEMS.map((item) => (
          <label key={item.key} className="flex cursor-pointer items-start gap-3 p-3 text-sm hover:bg-bg-elevated">
            <input
              type="checkbox"
              checked={checklist[item.key]}
              onChange={(e) => onChange({ ...checklist, [item.key]: e.target.checked })}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span>
              <span className="font-medium text-text">{item.label}</span>
              <span className="block text-text-muted">{item.description}</span>
            </span>
          </label>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" disabled={saving} onClick={onSave} className="self-start">
        {saving ? "Saving…" : "Save checklist"}
      </Button>

      {/* Ownership-docs note — always visible here (§1/§12), no upload field anywhere */}
      <p className="rounded-lg border border-border bg-bg-elevated p-3 text-xs text-text-muted">
        Verification checklist data only. Do not upload ownership documents.
      </p>
    </div>
  );
}
