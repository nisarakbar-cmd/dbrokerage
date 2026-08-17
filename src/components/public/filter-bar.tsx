import { SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Presentational only — wired to URL params + server-side query in M2.
export interface FilterBarProps {
  className?: string;
}

export function FilterBar({ className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-end gap-3 rounded-xl border border-border bg-bg-surface p-4", className)}>
      <Field label="Location">
        <Select>
          <SelectTrigger className="w-full min-w-36 sm:w-auto">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cda">CDA</SelectItem>
            <SelectItem value="dha">DHA</SelectItem>
            <SelectItem value="bahria-town">Bahria Town</SelectItem>
            <SelectItem value="bahria-enclave">Bahria Enclave</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Property type">
        <Select>
          <SelectTrigger className="w-full min-w-32 sm:w-auto">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="plot">Plot</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Price">
        <Select>
          <SelectTrigger className="w-full min-w-32 sm:w-auto">
            <SelectValue placeholder="Any price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-50l">Under 50 Lakh</SelectItem>
            <SelectItem value="50l-1cr">50 Lakh – 1 Crore</SelectItem>
            <SelectItem value="1cr-5cr">1 – 5 Crore</SelectItem>
            <SelectItem value="5cr-plus">5 Crore+</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Bedrooms">
        <Select>
          <SelectTrigger className="w-full min-w-24 sm:w-auto">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Size">
        <Select>
          <SelectTrigger className="w-full min-w-28 sm:w-auto">
            <SelectValue placeholder="Any size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5-marla">5 Marla</SelectItem>
            <SelectItem value="10-marla">10 Marla</SelectItem>
            <SelectItem value="1-kanal">1 Kanal</SelectItem>
            <SelectItem value="2-kanal">2 Kanal</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Button variant="ghost" size="sm" className="text-text-muted">
        <SlidersHorizontal />
        More filters
      </Button>

      <Button variant="primary" size="sm" className="ml-auto">
        <Search />
        Search
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-text-muted uppercase">{label}</span>
      {children}
    </div>
  );
}
