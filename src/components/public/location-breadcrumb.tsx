import { ChevronRight } from "lucide-react";
import { buildLocationBreadcrumb, type LocationHierarchy } from "@/lib/location";
import { cn } from "@/lib/utils";

export interface LocationBreadcrumbProps {
  location: LocationHierarchy;
  className?: string;
}

export function LocationBreadcrumb({ location, className }: LocationBreadcrumbProps) {
  const crumbs = buildLocationBreadcrumb(location);

  return (
    <nav aria-label="Location" className={cn("flex flex-wrap items-center gap-1 text-sm text-text-muted", className)}>
      {crumbs.map((crumb, i) => (
        <span key={`${crumb}-${i}`} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5 text-text-subtle" aria-hidden="true" />}
          <span className={i === crumbs.length - 1 ? "text-text" : undefined}>{crumb}</span>
        </span>
      ))}
    </nav>
  );
}
