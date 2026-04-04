"use client";

import { FormEvent, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button } from "@amb-app/ui/components/button";
import { Card } from "@amb-app/ui/components/card";
import { Input } from "@amb-app/ui/components/input";
import { getLocalizedApiErrorFromCode } from "@/lib/api/error-i18n";
import { sanitizeNextPathForRouter } from "@/lib/auth/sanitize-next-path";
import { useProjectContext } from "@/lib/context/project-context";

export function LoginForm() {
  const isProduction = process.env.NODE_ENV === "production";
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadProjects } = useProjectContext();

  const [email, setEmail] = useState(isProduction ? "" : "admin@local.test");
  const [password, setPassword] = useState(isProduction ? "" : "ChangeMe123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(
    () => sanitizeNextPathForRouter(searchParams.get("next"), locale),
    [searchParams, locale],
  );

  const nextQuery = searchParams.get("next");
  const registerHref = useMemo(() => {
    if (!nextQuery) return "/register";
    return { pathname: "/register" as const, query: { next: nextQuery } };
  }, [nextQuery]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      await loadProjects();
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
              placeholder={isProduction ? "you@example.com" : "admin@local.test"}
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
              placeholder={t("passwordPlaceholder")}
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("signingIn") : t("signIn")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href={registerHref}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("linkToRegister")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
