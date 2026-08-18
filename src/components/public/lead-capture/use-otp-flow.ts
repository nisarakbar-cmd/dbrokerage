"use client";

import { useCallback, useEffect, useState } from "react";
import type { LeadSourceValue } from "@/lib/validation";

export type OtpFlowStep = "details" | "code" | "success";

export interface LeadPayload {
  name: string;
  email?: string;
  message?: string;
  source: LeadSourceValue;
  listingId?: string;
  propertyInterest?: string;
  preferredTime?: string; // ISO string
}

const RESEND_COOLDOWN_SECONDS = 30;

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; error?: string; leadId?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Something went wrong. Please try again." };
    }
    return { ok: true, leadId: data.leadId };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}

function requestOtp(phone: string, source: LeadSourceValue, honeypot: string) {
  return postJson("/api/otp/request", { phone, source, honeypot });
}

export function useOtpFlow() {
  const [step, setStep] = useState<OtpFlowStep>("details");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [pendingLead, setPendingLead] = useState<LeadPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const submitDetails = useCallback(async (phoneValue: string, lead: LeadPayload, honeypotValue: string) => {
    setLoading(true);
    setError(null);
    const result = await requestOtp(phoneValue, lead.source, honeypotValue);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    setPhone(phoneValue);
    setHoneypot(honeypotValue);
    setPendingLead(lead);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    setStep("code");
  }, []);

  const submitCode = useCallback(
    async (code: string) => {
      if (!pendingLead) return;
      setLoading(true);
      setError(null);
      const result = await postJson("/api/otp/verify", { phone, code, honeypot, lead: pendingLead });
      setLoading(false);
      if (!result.ok) {
        setError(result.error ?? "That code didn't work. Check the code or request a new one.");
        return;
      }
      setStep("success");
    },
    [phone, honeypot, pendingLead]
  );

  const resend = useCallback(async () => {
    if (resendCooldown > 0 || !pendingLead) return;
    setError(null);
    setLoading(true);
    const result = await requestOtp(phone, pendingLead.source, honeypot);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, [phone, honeypot, pendingLead, resendCooldown]);

  const backToDetails = useCallback(() => {
    setError(null);
    setStep("details");
  }, []);

  const reset = useCallback(() => {
    setStep("details");
    setPhone("");
    setHoneypot("");
    setPendingLead(null);
    setError(null);
    setLoading(false);
    setResendCooldown(0);
  }, []);

  return {
    step,
    phone,
    loading,
    error,
    resendCooldown,
    submitDetails,
    submitCode,
    resend,
    backToDetails,
    reset,
  };
}
