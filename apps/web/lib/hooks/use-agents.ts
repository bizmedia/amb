"use client";

import { useState, useEffect, useCallback } from "react";
import type { Agent } from "@/lib/types";
import { useProjectId } from "@/lib/context/project-context";
import { withProjectId } from "@/lib/api/build-url";
import { fetchApiData, isAuthError } from "@/lib/api/http";

export function useAgents() {
  const projectId = useProjectId();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    if (!projectId) {
      setAgents([]);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchApiData<Agent[]>(withProjectId(projectId, "/api/agents"));
      setAgents(data);
      setError(null);
    } catch (err) {
      setError(
        isAuthError(err)
          ? "Authentication required. Please log in."
          : err instanceof Error
            ? err.message
            : "Failed to fetch agents"
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const deleteAgent = useCallback(
    async (agentId: string) => {
      if (!projectId) return;
      const res = await fetch(withProjectId(projectId, `/api/agents/${agentId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error((json?.error?.message as string) ?? "Failed to delete agent");
      }
      await fetchAgents();
    },
    [projectId, fetchAgents]
  );

  const updateAgent = useCallback(
    async (agentId: string, data: { name?: string; role?: string }) => {
      if (!projectId) return;
      const res = await fetch(withProjectId(projectId, `/api/agents/${agentId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error((json?.error?.message as string) ?? "Failed to update agent");
      }
      await fetchAgents();
    },
    [projectId, fetchAgents]
  );

  return { agents, loading, error, refetch: fetchAgents, deleteAgent, updateAgent };
}
