import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Toaster } from "@/components/ui/sonner";
import { getLeadsKpis } from "@/lib/leads";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Middleware already gates this route group — session is guaranteed here,
  // but the type is still `Session | null`, so this narrows it for the UI.
  const session = await auth();
  const userName = session?.user?.name ?? "Admin";

  const [{ followUpsDue }, agents, listings] = await Promise.all([
    // Notification bell shows a real count (follow-ups due) or nothing —
    // never a fabricated number (same honesty rule as the KPI deltas).
    getLeadsKpis(),
    db.agent.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.listing.findMany({
      where: { archivedAt: null },
      select: { id: true, title: true, areaLabel: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar userName={userName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar notificationCount={followUpsDue.value} agents={agents} listings={listings} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
