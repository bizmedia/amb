"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import type { Epic, EpicStatus } from "@amb-app/shared";
import { fetchApiData } from "@/lib/api/http";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";

export type EpicListItem = Epic & { _count?: { tasks: number } };

export function useEpics(projectId: string, statusFilter?: EpicStatus | "ALL" | "ARCHIVED") {
  const tCommon = useTranslations("Common");
  const [epics, setEpics] = useState<EpicListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEpics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      const qs = params.toString();
      const data = await fetchApiData<EpicListItem[]>(
        `/api/projects/${projectId}/epics${qs ? `?${qs}` : ""}`,
      );
      setEpics(data);
      setError(null);
    } catch (fetchError) {
      setError(getLocalizedApiErrorMessage(fetchError, tCommon));
    } finally {
      setLoading(false);
    }
  }, [projectId, statusFilter, tCommon]);

  useEffect(() => {
    void fetchEpics();
  }, [fetchEpics]);

  const createEpic = useCallback(
    async (input: { title: string; description?: string | null; status?: EpicStatus }) => {
      const epic = await fetchApiData<Epic>(`/api/projects/${projectId}/epics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await fetchEpics();
      return epic;
    },
    [fetchEpics, projectId],
  );

  const updateEpic = useCallback(
    async (
      epicId: string,
      input: { title?: string; description?: string | null; status?: EpicStatus },
    ) => {
      const epic = await fetchApiData<Epic>(`/api/projects/${projectId}/epics/${epicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await fetchEpics();
      return epic;
    },
    [fetchEpics, projectId],
  );

  const archiveEpic = useCallback(
    async (epicId: string) => {
      await fetchApiData<Epic>(`/api/projects/${projectId}/epics/${epicId}`, {
        method: "DELETE",
      });
      await fetchEpics();
    },
    [fetchEpics, projectId],
  );

  return {
    epics,
    loading,
    error,
    refetch: fetchEpics,
    createEpic,
    updateEpic,
    archiveEpic,
  };
}
