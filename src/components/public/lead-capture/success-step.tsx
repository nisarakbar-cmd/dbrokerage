import { CheckCircle2 } from "lucide-react";

export interface SuccessStepProps {
  title: string;
  message: string;
}

export function SuccessStep({ title, message }: SuccessStepProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
      <p className="text-lg font-semibold text-text">{title}</p>
      <p className="max-w-xs text-sm text-text-muted">{message}</p>
    </div>
  );
}
