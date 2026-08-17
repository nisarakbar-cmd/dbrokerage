import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SellCta() {
  return (
    <div className="border-t border-border bg-bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6">
        <h2 className="text-2xl font-semibold text-text">Thinking of selling?</h2>
        <p className="max-w-md text-sm text-text-muted">
          Tell us about your property and a dBrokerage agent will follow up —
          no self-listing, no ownership documents required to get started.
        </p>
        <Button asChild variant="primary">
          <Link href="/sell">Get started</Link>
        </Button>
      </div>
    </div>
  );
}
