import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = { title: "Viewings | dBrokerage Admin" };

export default function AdminViewingsPage() {
  return <ComingSoon title="Viewings" milestone="M6" />;
}
