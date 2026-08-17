import Link from "next/link";

const FOOTER_LINKS = [
  { label: "How it Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact Us", href: "/contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-base">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Link href="/" className="text-lg font-semibold tracking-tight text-text">
            <span className="text-primary">d</span>Brokerage
          </Link>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-muted hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-1 border-t border-border pt-6 text-xs text-text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>Controlled inventory across Islamabad &amp; Rawalpindi.</p>
          <p>© 2026 dBrokerage</p>
        </div>
      </div>
    </footer>
  );
}
