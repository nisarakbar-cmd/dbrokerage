import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSearchCard } from "@/components/public/hero-search-card";
import { ExploreProperties } from "@/components/public/explore-properties";
import { TrustStrip } from "@/components/public/trust-strip";
import { SellCta } from "@/components/public/sell-cta";
import { getExploreSectionListings } from "@/lib/listings";

// Listing inventory changes via the admin (publish/unpublish, availability)
// independently of deploys — revalidate periodically rather than freezing
// this page at build time.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "dBrokerage — Controlled inventory in Islamabad & Rawalpindi",
  description:
    "Checked inventory, phone-verified inquiries, browse account-free. A residential sales portal for Islamabad & Rawalpindi.",
};

export default async function Home() {
  const listingsByTier = await getExploreSectionListings();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
              Islamabad &amp; Rawalpindi residential sales
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold text-text sm:text-5xl">
              Find your next home with confidence
            </h1>
            <p className="max-w-xl text-base text-text-muted">
              Controlled inventory across Islamabad &amp; Rawalpindi — checked
              listings, phone-verified inquiries, and no account needed to
              browse.
            </p>
          </div>
          <HeroSearchCard />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-semibold text-text">Explore properties</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/buy">View all properties</Link>
          </Button>
        </div>
        <ExploreProperties listingsByTier={listingsByTier} />
      </section>

      <TrustStrip />
      <SellCta />
    </>
  );
}
