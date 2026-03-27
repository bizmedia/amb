"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ChangePasswordCard() {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        const msg =
          typeof json?.error?.message === "string"
            ? json.error.message
            : tCommon("apiErrors.httpError");
        throw new Error(msg);
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("apiErrors.unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-elevation">
      <CardHeader>
        <CardTitle>{t("passwordSection")}</CardTitle>
        <CardDescription>{t("passwordSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="current-password">
              {t("currentPassword")}
            </label>
            <Input
              id="current-password"
              autoComplete="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              minLength={1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="new-password">
              {t("newPassword")}
            </label>
            <Input
              id="new-password"
              autoComplete="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="confirm-password">
              {t("confirmPassword")}
            </label>
            <Input
              id="confirm-password"
              autoComplete="new-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? <p className="text-sm text-muted-foreground">{t("passwordChanged")}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? t("passwordSaving") : t("passwordSubmit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
