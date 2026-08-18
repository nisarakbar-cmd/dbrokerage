export interface LeadFormCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function LeadFormCard({ title, description, children }: LeadFormCardProps) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-border bg-bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-text">{title}</h1>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
