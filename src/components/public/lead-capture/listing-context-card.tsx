import { MapPin } from "lucide-react";

export interface ListingContext {
  id: string;
  title: string;
  areaLabel: string;
  price: string;
}

export function ListingContextCard({ listing }: { listing: ListingContext }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm">
      <p className="font-medium text-text">{listing.title}</p>
      <div className="flex items-center justify-between gap-2 text-text-muted">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {listing.areaLabel}
        </span>
        <span className="font-medium tabular-nums text-text">{listing.price}</span>
      </div>
    </div>
  );
}
