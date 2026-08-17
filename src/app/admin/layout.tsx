export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* AdminSidebar + AdminTopbar land in M4 */}
      {children}
    </div>
  );
}
