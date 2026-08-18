"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/public/lead-capture/form-field";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);

    if (!result || result.error) {
      setError("Incorrect email or password.");
      return;
    }

    router.push("/admin/leads");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField label="Email" error={form.formState.errors.email?.message}>
        <Input {...form.register("email")} type="email" placeholder="you@dbrokerage.pk" autoComplete="email" autoFocus />
      </FormField>

      <FormField label="Password" error={form.formState.errors.password?.message}>
        <Input {...form.register("password")} type="password" placeholder="••••••••" autoComplete="current-password" />
      </FormField>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? "Signing in…" : "Log In"}
      </Button>
    </form>
  );
}
