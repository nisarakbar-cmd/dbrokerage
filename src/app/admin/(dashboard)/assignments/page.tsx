import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = { title: "Assignments | dBrokerage Admin" };

export default function AdminAssignmentsPage() {
  return <ComingSoon title="Assignments" milestone="M6" />;
}
