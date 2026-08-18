import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingForm } from "@/components/admin/listing-form";
import { getListingForEdit } from "@/lib/admin-listings";

export const metadata: Metadata = { title: "Edit Listing | dBrokerage Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingForEdit(id);
  if (!listing) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">{listing.title}</h1>
        <p className="text-sm text-text-muted">
          {listing.leadCount} lead{listing.leadCount === 1 ? "" : "s"} · {listing.viewingCount} viewing
          {listing.viewingCount === 1 ? "" : "s"}
        </p>
      </div>
      <ListingForm mode="edit" initialData={listing} />
    </div>
  );
}
