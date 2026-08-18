import type { Metadata } from "next";
import { LeadFormCard } from "@/components/public/lead-capture/lead-form-card";
import { HomeEstimatorForm } from "@/components/public/home-estimator-form";

export const metadata: Metadata = {
  title: "Home Estimator | dBrokerage",
  description:
    "Request a home estimate. Tell us about your property and a dBrokerage agent will follow up with an estimate — no automated valuation, no number shown here.",
};

export default function HomeEstimatorPage() {
  return (
    <LeadFormCard
      title="Request a home estimate"
      description="Tell us about your property and a dBrokerage agent will follow up with an estimate. This is a request for a human review, not an instant valuation."
    >
      <HomeEstimatorForm />
    </LeadFormCard>
  );
}
