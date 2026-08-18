"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MarketUpdatesDialog } from "@/components/public/market-updates-dialog";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Buy", href: "/buy" },
  { label: "Sell", href: "/sell" },
  { label: "Home Estimator", href: "/home-estimator" },
] as const;

function NavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "border-b-2 border-transparent pb-1 text-sm font-medium text-text-muted transition-colors hover:text-text",
        active && "border-primary text-primary hover:text-primary"
      )}
    >
      {label}
    </Link>
  );
}

function InvestLink({ className }: { className?: string }) {
  const investUrl = process.env.NEXT_PUBLIC_INVEST_URL;
  // Degrade gracefully when unset — no dead "#" link.
  if (!investUrl) return null;

  return (
    <a
      href={investUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 border-b-2 border-transparent pb-1 text-sm font-medium text-text-muted transition-colors hover:text-text",
        className
      )}
    >
      Invest
      <ExternalLink className="size-3.5" aria-hidden="true" />
    </a>
  );
}

export function TopNav() {
  const [open, setOpen] = useState(false);
  const [marketUpdatesOpen, setMarketUpdatesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-base/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-text">
          <span className="text-primary">d</span>Brokerage
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          <InvestLink />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/admin/login" className="text-sm font-medium text-text-muted hover:text-text">
            Log In
          </Link>
          <Button variant="outline" size="sm" onClick={() => setMarketUpdatesOpen(true)}>
            Sign Up
          </Button>
        </div>

        <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden" onClick={() => setOpen(true)}>
          <Menu className="size-5" />
        </Button>
      </div>

      {/* Radix-based Sheet — focus trap, Escape-to-close, and focus-return
          to the trigger all come for free (§12 accessibility floor). */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-72 sm:max-w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 pb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-text hover:bg-bg-elevated"
              >
                {link.label}
              </Link>
            ))}
            <InvestLink className="rounded-lg px-2 py-2.5 hover:bg-bg-elevated" />

            <div className="my-3 border-t border-border" />

            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-text hover:bg-bg-elevated"
            >
              Log In
            </Link>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => {
                setOpen(false);
                setMarketUpdatesOpen(true);
              }}
            >
              Sign Up
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      <MarketUpdatesDialog open={marketUpdatesOpen} onOpenChange={setMarketUpdatesOpen} />
    </header>
  );
}
