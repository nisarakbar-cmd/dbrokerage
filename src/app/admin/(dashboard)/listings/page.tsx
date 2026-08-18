import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingsTable } from "@/components/admin/listings-table";
import { getAdminListingsPage, parseAdminListingsFilters } from "@/lib/admin-listings";

export const metadata: Metadata = { title: "Listings | dBrokerage Admin" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const filters = parseAdminListingsFilters(rawParams);
  const data = await getAdminListingsPage(filters);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Listings</h1>
        <Link href="/admin/listings/new">
          <Button variant="primary">
            <Plus />
            New listing
          </Button>
        </Link>
      </div>

      <ListingsTable data={data} />
    </div>
  );
}
