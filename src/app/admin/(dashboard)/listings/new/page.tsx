import type { Metadata } from "next";
import { ListingForm } from "@/components/admin/listing-form";

export const metadata: Metadata = { title: "New Listing | dBrokerage Admin" };

export default function NewListingPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-text">New listing</h1>
      <ListingForm mode="create" />
    </div>
  );
}
