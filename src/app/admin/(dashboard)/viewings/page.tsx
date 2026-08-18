import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getViewingsPage, parseViewingsFilters } from "@/lib/viewings";
import { ViewingsTable } from "@/components/admin/viewings-table";

export const metadata: Metadata = { title: "Viewings | dBrokerage Admin" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminViewingsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const filters = parseViewingsFilters(rawParams);

  const [data, agents] = await Promise.all([
    getViewingsPage(filters),
    db.agent.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-text">Viewings</h1>
      <ViewingsTable data={data} agents={agents} />
    </div>
  );
}
