import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dBrokerage — Islamabad & Rawalpindi",
  description:
    "Controlled inventory across Islamabad & Rawalpindi. Checked inventory, phone-verified inquiries, browse account-free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
