import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
        Controlled inventory · Islamabad &amp; Rawalpindi
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold text-text sm:text-5xl">
        dBrokerage setup is live
      </h1>
      <p className="max-w-xl text-base text-text-muted">
        Next.js 15, Tailwind v4, shadcn/ui and Prisma are wired up. This
        placeholder proves the dark theme, fonts and design tokens render
        correctly &mdash; the real homepage ships in M1&ndash;M2.
      </p>
      <Button>Request a Viewing</Button>
    </main>
  );
}
