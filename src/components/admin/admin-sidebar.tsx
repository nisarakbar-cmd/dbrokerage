"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Building2, CalendarClock, UserCog, ShieldCheck, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth-actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Leads & Pipeline", href: "/admin/leads", icon: Users },
  { label: "Listings", href: "/admin/listings", icon: Building2 },
  { label: "Viewings", href: "/admin/viewings", icon: CalendarClock },
  { label: "Assignments", href: "/admin/assignments", icon: UserCog },
] as const;

export interface AdminSidebarProps {
  userName: string;
}

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Link href="/admin/leads" className="text-lg font-semibold tracking-tight text-text">
          <span className="text-primary">d</span>Brokerage
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-bg-elevated hover:text-text",
                    active && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col gap-3 border-t border-border p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-success">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Admin access
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">{userName}</p>
            <p className="text-xs text-text-muted">Administrator</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="inline-flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-elevated hover:text-text"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
