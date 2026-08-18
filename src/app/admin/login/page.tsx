import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Log In | dBrokerage",
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-12">
      <div className="rounded-xl border border-border bg-bg-surface p-6 sm:p-8">
        <p className="text-xs font-medium tracking-wide text-text-muted uppercase">Admin access</p>
        <h1 className="mt-1 text-2xl font-semibold text-text">
          <span className="text-primary">d</span>Brokerage
        </h1>
        <p className="mt-1 text-sm text-text-muted">Sign in to manage leads, listings and viewings.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
