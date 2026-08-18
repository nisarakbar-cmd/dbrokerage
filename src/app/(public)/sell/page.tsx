import type { Metadata } from "next";
import { LeadFormCard } from "@/components/public/lead-capture/lead-form-card";
import { SellForm } from "@/components/public/sell-form";

export const metadata: Metadata = {
  title: "Thinking of Selling? | dBrokerage",
  description:
    "Tell us about your property and a dBrokerage agent will follow up. This creates a lead only — nothing is published, no ownership documents required.",
};

export default function SellPage() {
  return (
    <LeadFormCard
      title="Thinking of selling?"
      description="Tell us about your property and a dBrokerage agent will follow up. This is a lead only — nothing gets published, and we never ask for ownership documents here."
    >
      <SellForm />
    </LeadFormCard>
  );
}
