import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Middleware already gates this route group — session is guaranteed here,
  // but the type is still `Session | null`, so this narrows it for the UI.
  const session = await auth();
  const userName = session?.user?.name ?? "Admin";

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar userName={userName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
