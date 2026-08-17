import { Button } from "@/components/ui/button";
import { TrustStrip } from "@/components/public/trust-strip";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
          Controlled inventory · Islamabad &amp; Rawalpindi
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold text-text sm:text-5xl">
          dBrokerage setup is live
        </h1>
        <p className="max-w-xl text-base text-text-muted">
          Next.js 15, Tailwind v4, shadcn/ui and Prisma are wired up. This
          placeholder proves the dark theme, fonts and design tokens render
          correctly &mdash; the real homepage ships in M2. See{" "}
          <a href="/styleguide" className="text-primary hover:underline">
            /styleguide
          </a>{" "}
          for the full M1 design system.
        </p>
        <Button>Request a Viewing</Button>
      </div>
      <TrustStrip />
    </>
  );
}
