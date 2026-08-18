"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return (
    <a
      href={process.env.NEXT_PUBLIC_INVEST_URL || "#"}
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

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

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          className="inline-flex size-9 items-center justify-center rounded-lg text-text md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile slide-in drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 transition-opacity motion-reduce:transition-none md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      >
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute top-0 right-0 flex h-full w-72 flex-col gap-1 border-l border-border bg-bg-surface p-6 transition-transform motion-reduce:transition-none",
            open ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
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
        </div>
      </div>

      <MarketUpdatesDialog open={marketUpdatesOpen} onOpenChange={setMarketUpdatesOpen} />
    </header>
  );
}
