"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLocalizedApiErrorFromCode } from "@/lib/api/error-i18n";

function sanitizeNextPath(nextValue: string | null, locale: string): string {
  if (!nextValue || !nextValue.startsWith(`/${locale}`)) {
    return "/";
  }

  const withoutLocale = nextValue.slice(`/${locale}`.length);
  if (!withoutLocale || withoutLocale === "/") {
    return "/";
  }
  return withoutLocale;
}

export function LoginForm() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("admin@local.test");
  const [password, setPassword] = useState("ChangeMe123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(
    () => sanitizeNextPath(searchParams.get("next"), locale),
    [searchParams, locale]
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(getLocalizedApiErrorFromCode(json?.error?.code, tCommon));
      }
      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : tCommon("apiErrors.authFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="amb-login-surface flex items-center justify-center p-5 md:p-6">
      <Card className="shadow-elevation-md w-full max-w-sm border-border/80 p-6 md:p-7">
        <div className="mb-6 space-y-2 text-center sm:text-left">
          <p className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-primary">
            Agent Message Bus
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              {t("email")}
            </label>
            <Input
              id="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@local.test"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              {t("password")}
            </label>
            <Input
              id="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("signingIn") : t("signIn")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
