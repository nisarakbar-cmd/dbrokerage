import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getAssignmentsData } from "@/lib/assignments";
import { AssignmentsView } from "@/components/admin/assignments-view";

export const metadata: Metadata = { title: "Assignments | dBrokerage Admin" };

export default async function AdminAssignmentsPage() {
  const [groups, agents] = await Promise.all([
    getAssignmentsData(),
    db.agent.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-text">Assignments</h1>
      <AssignmentsView groups={groups} agents={agents} />
    </div>
  );
}
