import { Phone, ShieldCheck, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TRUST_ITEMS: { icon: LucideIcon; title: string; subtitle: string }[] = [
  {
    icon: ShieldCheck,
    title: "Checked inventory",
    subtitle: "Listings reviewed for accuracy",
  },
  {
    icon: Phone,
    title: "Phone-verified inquiries",
    subtitle: "Real conversations, no spam",
  },
  {
    icon: User,
    title: "Browse account-free",
    subtitle: "Sign up only for market updates",
  },
];

export function TrustStrip() {
  return (
    <div className="border-y border-border bg-bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col divide-y divide-border px-4 py-8 sm:px-6 md:flex-row md:divide-x md:divide-y-0">
        {TRUST_ITEMS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex flex-1 items-start gap-3 py-4 md:justify-center md:py-0 md:first:pl-0 md:last:pr-0 md:px-6">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-text">{title}</p>
              <p className="text-xs text-text-muted">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
