"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { fetchApiData } from "@/lib/api/http";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";

export type ProjectToken = {
  id: string;
  name: string;
  issuedBy: string | null;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
};

export type CreatedProjectToken = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  claims: {
    sub: string;
    tenantId: string;
    projectId: string;
    type: string;
    jti: string;
  };
};

export function useProjectTokens(projectId: string) {
  const tCommon = useTranslations("Common");
  const [tokens, setTokens] = useState<ProjectToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApiData<ProjectToken[]>(`/api/projects/${projectId}/tokens`);
      setTokens(data);
      setError(null);
    } catch (fetchError) {
      setError(getLocalizedApiErrorMessage(fetchError, tCommon));
    } finally {
      setLoading(false);
    }
  }, [projectId, tCommon]);

  const createToken = useCallback(
    async (input: { name: string; expiresIn?: number }) => {
      const data = await fetchApiData<CreatedProjectToken>(`/api/projects/${projectId}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await fetchTokens();
      return data;
    },
    [fetchTokens, projectId]
  );

  const revokeToken = useCallback(
    async (tokenId: string) => {
      await fetchApiData<ProjectToken>(`/api/projects/${projectId}/tokens/${tokenId}/revoke`, {
        method: "POST",
      });
      await fetchTokens();
    },
    [fetchTokens, projectId]
  );

  useEffect(() => {
    void fetchTokens();
  }, [fetchTokens]);

  return { tokens, loading, error, refetch: fetchTokens, createToken, revokeToken };
}
