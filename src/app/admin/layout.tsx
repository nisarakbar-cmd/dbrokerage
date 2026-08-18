export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Deliberately minimal — /admin/login renders directly under this
          layout with no chrome. The sidebar/topbar shell lives in
          admin/(dashboard)/layout.tsx, wrapping only the gated pages. */}
      {children}
    </div>
  );
}
