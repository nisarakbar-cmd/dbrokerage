import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = { title: "Listings | dBrokerage Admin" };

export default function AdminListingsPage() {
  return <ComingSoon title="Listings" milestone="M5" />;
}
