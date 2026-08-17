import { TopNav } from "@/components/public/top-nav";
import { Footer } from "@/components/public/footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
