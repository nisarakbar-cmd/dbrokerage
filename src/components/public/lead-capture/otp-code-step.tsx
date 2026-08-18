"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface OtpCodeStepProps {
  phone: string;
  loading: boolean;
  error: string | null;
  resendCooldown: number;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
}

export function OtpCodeStep({ phone, loading, error, resendCooldown, onSubmit, onResend, onBack }: OtpCodeStepProps) {
  const [code, setCode] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(code);
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-text-muted">
        We sent a 6-digit code to <span className="font-medium text-text">{phone}</span>.
      </p>

      <Input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="text-center text-lg tracking-[0.3em] tabular-nums"
        autoFocus
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="primary" disabled={loading || code.length !== 6} className="w-full">
        {loading ? "Verifying…" : "Verify code"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-text-muted hover:text-text">
          Edit details
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={loading || resendCooldown > 0}
          className="text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-subtle disabled:no-underline"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}
