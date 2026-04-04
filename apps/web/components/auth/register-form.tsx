"use client";

import { FormEvent, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { signupSchema } from "@amb-app/shared";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@amb-app/ui/components/button";
import { Card } from "@amb-app/ui/components/card";
import { Input } from "@amb-app/ui/components/input";
import { Label } from "@amb-app/ui/components/label";
import { getLocalizedApiErrorFromCode } from "@/lib/api/error-i18n";
import { sanitizeNextPathForRouter } from "@/lib/auth/sanitize-next-path";
import { useProjectContext } from "@/lib/context/project-context";

type FieldErrors = Partial<Record<"email" | "password" | "confirmPassword" | "displayName", string>>;

function buildSignupBody(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  const trimmedName = input.displayName.trim();
  return {
    email: input.email.trim(),
    password: input.password,
    ...(trimmedName ? { displayName: trimmedName } : {}),
  };
}

function validateRegisterForm(input: {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}): { ok: true; body: { email: string; password: string; displayName?: string } } | { ok: false; fieldErrors: FieldErrors } {
  const fieldErrors: FieldErrors = {};
  const body = buildSignupBody(input);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email") {
        fieldErrors.email = "email";
      } else if (key === "password") {
        if (issue.code === "too_small") fieldErrors.password = "passwordMin";
        else if (issue.code === "too_big") fieldErrors.password = "passwordMax";
        else fieldErrors.password = "passwordMin";
      } else if (key === "displayName") {
        if (issue.code === "too_big") fieldErrors.displayName = "displayNameMax";
        else fieldErrors.displayName = "displayNameMin";
      }
    }
    if (Object.keys(fieldErrors).length === 0) {
      fieldErrors.email = "email";
    }
  }

  if (input.password !== input.confirmPassword) {
    fieldErrors.confirmPassword = "mismatch";
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, body: parsed.data };
}

export function RegisterForm() {
  const isProduction = process.env.NODE_ENV === "production";
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadProjects } = useProjectContext();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const nextPath = useMemo(
    () => sanitizeNextPathForRouter(searchParams.get("next"), locale),
    [searchParams, locale],
  );

  const nextQuery = searchParams.get("next");
  const loginHref = useMemo(() => {
    if (!nextQuery) return "/login";
    return { pathname: "/login" as const, query: { next: nextQuery } };
  }, [nextQuery]);

  const translateFieldError = (code: string | undefined) => {
    if (!code) return "";
    const map: Record<string, string> = {
      email: t("validationEmail"),
      passwordMin: t("validationPasswordMin"),
      passwordMax: t("validationPasswordMax"),
      mismatch: t("passwordMismatch"),
      displayNameMin: t("validationDisplayNameMin"),
      displayNameMax: t("validationDisplayNameMax"),
    };
    return map[code] ?? tCommon("error");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const validation = validateRegisterForm({
      email,
      password,
      confirmPassword,
      displayName,
    });

    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.body),
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

  const clearFieldError = (key: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div className="amb-login-surface flex items-center justify-center p-5 md:p-6">
      <Card className="shadow-elevation-md w-full max-w-md border-border/80 p-6 md:p-8">
        <div className="mb-6 space-y-2 text-center sm:text-left">
          <p className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-primary">
            Agent Message Bus
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{t("registerTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("registerSubtitle")}</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="register-email" className="text-sm font-medium">
              {t("email")}
            </Label>
            <Input
              id="register-email"
              autoComplete="email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              placeholder={isProduction ? "you@example.com" : "admin@local.test"}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
            />
            {fieldErrors.email ? (
              <p id="register-email-error" className="text-sm text-destructive" role="alert">
                {translateFieldError(fieldErrors.email)}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-display-name" className="text-sm font-medium">
              {t("displayName")}
              <span className="ml-1 font-normal text-muted-foreground">({t("optional")})</span>
            </Label>
            <Input
              id="register-display-name"
              autoComplete="name"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                clearFieldError("displayName");
              }}
              placeholder={t("displayNamePlaceholder")}
              maxLength={120}
              aria-invalid={Boolean(fieldErrors.displayName)}
              aria-describedby={fieldErrors.displayName ? "register-display-name-error" : "register-display-name-hint"}
            />
            <p id="register-display-name-hint" className="text-xs text-muted-foreground">
              {t("displayNameHint")}
            </p>
            {fieldErrors.displayName ? (
              <p id="register-display-name-error" className="text-sm text-destructive" role="alert">
                {translateFieldError(fieldErrors.displayName)}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password" className="text-sm font-medium">
              {t("password")}
            </Label>
            <div className="relative">
              <Input
                id="register-password"
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                  clearFieldError("confirmPassword");
                }}
                placeholder={t("passwordPlaceholder")}
                className="pr-10"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? "register-password-error" : "register-password-hint"
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </Button>
            </div>
            <p id="register-password-hint" className="text-xs text-muted-foreground">
              {t("passwordRulesHint")}
            </p>
            {fieldErrors.password ? (
              <p id="register-password-error" className="text-sm text-destructive" role="alert">
                {translateFieldError(fieldErrors.password)}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm-password" className="text-sm font-medium">
              {t("confirmPassword")}
            </Label>
            <div className="relative">
              <Input
                id="register-confirm-password"
                autoComplete="new-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError("confirmPassword");
                }}
                placeholder={t("confirmPasswordPlaceholder")}
                className="pr-10"
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={
                  fieldErrors.confirmPassword ? "register-confirm-password-error" : undefined
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
              >
                {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </Button>
            </div>
            {fieldErrors.confirmPassword ? (
              <p id="register-confirm-password-error" className="text-sm text-destructive" role="alert">
                {translateFieldError(fieldErrors.confirmPassword)}
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("creatingAccount") : t("createAccount")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href={loginHref} className="font-medium text-primary underline-offset-4 hover:underline">
            {t("linkToLogin")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
