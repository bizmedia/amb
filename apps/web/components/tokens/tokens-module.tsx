"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CopyIcon, CheckIcon, PlusIcon, BanIcon } from "lucide-react";

import { useProjectTokens } from "@/lib/hooks/use-project-tokens";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";

type Props = {
  projectId: string;
  projectName: string;
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function TokensModule({ projectId, projectName }: Props) {
  const t = useTranslations("Tokens");
  const tCommon = useTranslations("Common");
  const { tokens, loading, error, createToken, revokeToken } = useProjectTokens(projectId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiresIn, setExpiresIn] = useState("2592000");
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const submitCreate = async () => {
    if (!name.trim()) return;

    setSubmitting(true);
    setCreateError(null);
    try {
      const parsedExpires = Number(expiresIn);
      const data = await createToken({
        name: name.trim(),
        expiresIn: Number.isFinite(parsedExpires) && parsedExpires > 0 ? parsedExpires : undefined,
      });
      setCreatedToken(data.accessToken);
      setName("");
      setExpiresIn("2592000");
    } catch (submitError) {
      setCreateError(getLocalizedApiErrorMessage(submitError, tCommon));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCreatedToken = async () => {
    if (!createdToken) return;
    await navigator.clipboard.writeText(createdToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 1500);
  };

  const handleRevoke = async (tokenId: string) => {
    setRevokingId(tokenId);
    try {
      await revokeToken(tokenId);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("projectLabel")}: {projectName}
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setCreatedToken(null);
              setCreateError(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusIcon className="size-4" />
              {t("createToken")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("createToken")}</DialogTitle>
              <DialogDescription>{t("createTokenDesc")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                placeholder={t("tokenNamePlaceholder")}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <Input
                type="number"
                min={1}
                placeholder={t("expiresInPlaceholder")}
                value={expiresIn}
                onChange={(event) => setExpiresIn(event.target.value)}
              />
              {createError ? <p className="text-sm text-destructive">{createError}</p> : null}

              {createdToken ? (
                <Card className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">{t("tokenCreated")}</p>
                  <pre className="max-h-28 overflow-auto rounded-md bg-muted p-2 text-xs">{createdToken}</pre>
                  <Button size="sm" variant="outline" onClick={handleCopyCreatedToken} className="gap-2">
                    {copiedToken ? <CheckIcon className="size-4 text-green-600" /> : <CopyIcon className="size-4" />}
                    {t("copyToken")}
                  </Button>
                </Card>
              ) : null}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {tCommon("close")}
              </Button>
              <Button onClick={submitCreate} disabled={submitting || !name.trim()}>
                {submitting ? t("creatingToken") : t("createToken")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">{tCommon("loading")}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-2">
        {tokens.map((token) => (
          <Card key={token.id} className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{token.name}</p>
                  {token.revokedAt ? (
                    <Badge variant="destructive">{t("revoked")}</Badge>
                  ) : (
                    <Badge variant="secondary">{t("active")}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("createdAt")}: {formatDate(token.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("lastUsedAt")}: {formatDate(token.lastUsedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("expiresAt")}: {formatDate(token.expiresAt)}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleRevoke(token.id)}
                disabled={Boolean(token.revokedAt) || revokingId === token.id}
              >
                <BanIcon className="size-4" />
                {t("revoke")}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!loading && tokens.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">{t("empty")}</Card>
      ) : null}
    </div>
  );
}
