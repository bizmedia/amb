"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import type { Sprint, SprintStatus } from "@amb-app/shared";
import { fetchApiData } from "@/lib/api/http";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";

export type SprintListItem = Sprint & { _count?: { tasks: number } };

export function useSprints(projectId: string, statusFilter?: SprintStatus | "ALL") {
  const tCommon = useTranslations("Common");
  const [sprints, setSprints] = useState<SprintListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSprints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      const qs = params.toString();
      const data = await fetchApiData<SprintListItem[]>(
        `/api/projects/${projectId}/sprints${qs ? `?${qs}` : ""}`,
      );
      setSprints(data);
      setError(null);
    } catch (fetchError) {
      setError(getLocalizedApiErrorMessage(fetchError, tCommon));
    } finally {
      setLoading(false);
    }
  }, [projectId, statusFilter, tCommon]);

  useEffect(() => {
    void fetchSprints();
  }, [fetchSprints]);

  const createSprint = useCallback(
    async (input: {
      name: string;
      goal?: string | null;
      startDate?: string | null;
      endDate?: string | null;
    }) => {
      await fetchApiData<Sprint>(`/api/projects/${projectId}/sprints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await fetchSprints();
    },
    [fetchSprints, projectId],
  );

  const updateSprint = useCallback(
    async (
      sprintId: string,
      input: {
        name?: string;
        goal?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        status?: SprintStatus;
      },
    ) => {
      await fetchApiData<Sprint>(`/api/projects/${projectId}/sprints/${sprintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await fetchSprints();
    },
    [fetchSprints, projectId],
  );

  const deletePlannedSprint = useCallback(
    async (sprintId: string) => {
      await fetchApiData<{ success: true }>(`/api/projects/${projectId}/sprints/${sprintId}`, {
        method: "DELETE",
      });
      await fetchSprints();
    },
    [fetchSprints, projectId],
  );

  const startSprint = useCallback(
    async (sprintId: string) => {
      await fetchApiData<Sprint>(`/api/projects/${projectId}/sprints/${sprintId}/start`, {
        method: "POST",
      });
      await fetchSprints();
    },
    [fetchSprints, projectId],
  );

  const completeSprint = useCallback(
    async (sprintId: string) => {
      await fetchApiData<Sprint>(`/api/projects/${projectId}/sprints/${sprintId}/complete`, {
        method: "POST",
      });
      await fetchSprints();
    },
    [fetchSprints, projectId],
  );

  return {
    sprints,
    loading,
    error,
    refetch: fetchSprints,
    createSprint,
    updateSprint,
    deletePlannedSprint,
    startSprint,
    completeSprint,
  };
}
