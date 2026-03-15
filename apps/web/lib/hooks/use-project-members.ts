"use client";

import { useCallback, useEffect, useState } from "react";

type ProjectMember = {
  id: string;
  name: string;
  role: string;
  status: string;
};

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/agents?projectId=${encodeURIComponent(projectId)}`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Failed to fetch project members");
      }

      setMembers(json?.data ?? []);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch project members");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
  };
}
