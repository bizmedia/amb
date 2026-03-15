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

  return { agents, loading, error, refetch: fetchAgents };
}
