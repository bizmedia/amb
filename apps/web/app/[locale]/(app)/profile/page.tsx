"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CopyIcon, UserRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { ChangePasswordCard } from "./change-password-card";

type SessionPayload = {
  authenticated: boolean;
  tokenType?: string | null;
  userId?: string | null;
  email?: string | null;
  tenantId?: string | null;
  projectId?: string | null;
  roles?: string[];
  expiresAt?: string | null;
};

function CopyField({ label, value }: { label: string; value: string }) {
  const t = useTranslations("Profile");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [value]);

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md bg-muted/80 px-2 py-1.5 font-mono text-xs">
          {value}
        </code>
        <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={handleCopy}>
          <CopyIcon className="size-4" />
          <span className="sr-only">{t("copy")}</span>
        </Button>
      </div>
      {copied ? <p className="text-xs text-muted-foreground">{t("copied")}</p> : null}
    </div>
  );
}

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const locale = useLocale();
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!mounted) return;
        const data = json?.data;
        if (!data?.authenticated) {
          const next = `${window.location.pathname}${window.location.search}`;
          window.location.href = `/${locale}/login?next=${encodeURIComponent(next)}`;
          return;
        }
        setSession({
          authenticated: true,
          tokenType: data.tokenType ?? null,
          userId: data.userId ?? null,
          email: data.email ?? null,
          tenantId: data.tenantId ?? null,
          projectId: data.projectId ?? null,
          roles: Array.isArray(data.roles) ? data.roles : [],
          expiresAt: data.expiresAt ?? null,
        });
      } catch {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [locale]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col overflow-auto bg-background">
        <main className="mx-auto w-full max-w-2xl space-y-6 px-5 py-5 md:px-6 md:py-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!session?.authenticated) {
    return null;
  }

  const displayName = session.email?.trim() || session.userId?.trim() || t("fallbackName");
  const rolesLine = session.roles?.length ? session.roles.join(", ") : "—";
  const expiresFormatted =
    session.expiresAt != null
      ? new Date(session.expiresAt).toLocaleString(locale === "ru" ? "ru-RU" : locale === "de" ? "de-DE" : "en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background">
      <main className="mx-auto w-full max-w-2xl space-y-6 px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-muted/60 text-muted-foreground">
            <UserRoundIcon className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{displayName}</p>
          </div>
        </div>

        <Card className="shadow-elevation">
          <CardHeader>
            <CardTitle>{t("accountSection")}</CardTitle>
            <CardDescription>{t("accountSectionDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{t("email")}</p>
              <p className="text-sm">{session.email?.trim() || "—"}</p>
            </div>
            {session.userId ? <CopyField label={t("userId")} value={session.userId} /> : null}
          </CardContent>
        </Card>

        {session.userId && session.tokenType !== "project" ? <ChangePasswordCard /> : null}

        <Card className="shadow-elevation">
          <CardHeader>
            <CardTitle>{t("sessionSection")}</CardTitle>
            <CardDescription>{t("sessionSectionDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.tenantId ? <CopyField label={t("tenantId")} value={session.tenantId} /> : null}
            {!session.tenantId ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{t("tenantId")}</p>
                <p className="text-sm">—</p>
              </div>
            ) : null}
            {session.projectId ? <CopyField label={t("projectId")} value={session.projectId} /> : null}
            {!session.projectId ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{t("projectId")}</p>
                <p className="text-sm">—</p>
              </div>
            ) : null}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{t("roles")}</p>
              <p className="text-sm">{rolesLine}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{t("tokenType")}</p>
              <p className="font-mono text-sm">{session.tokenType?.trim() || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{t("sessionExpires")}</p>
              <p className="text-sm">{expiresFormatted}</p>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">{t("footerHint")}</p>
      </main>
    </div>
  );
}
