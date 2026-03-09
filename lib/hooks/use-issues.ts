"use client";

import { useCallback, useEffect, useState } from "react";

import type { Issue, IssuePriority, IssueState } from "@/lib/types";

export type IssueFilters = {
  state?: IssueState | "ALL";
  priority?: IssuePriority | "ALL";
  assigneeId?: string | "ALL";
  dueFrom?: string;
  dueTo?: string;
};

export type IssueInput = {
  title: string;
  description?: string | null;
  state?: IssueState;
  priority?: IssuePriority;
  assigneeId?: string | null;
  dueDate?: string | null;
};

function buildIssueQuery(filters: IssueFilters): string {
  const params = new URLSearchParams();

  if (filters.state && filters.state !== "ALL") {
    params.set("state", filters.state);
  }
  if (filters.priority && filters.priority !== "ALL") {
    params.set("priority", filters.priority);
  }
  if (filters.assigneeId && filters.assigneeId !== "ALL") {
    params.set("assignee", filters.assigneeId);
  }
  if (filters.dueFrom) {
    params.set("dueFrom", filters.dueFrom);
  }
  if (filters.dueTo) {
    params.set("dueTo", filters.dueTo);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function toApiDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export function useIssues(projectId: string, filters: IssueFilters) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);

    try {
      const query = buildIssueQuery(filters);
      const res = await fetch(`/api/projects/${projectId}/issues${query}`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Failed to fetch issues");
      }

      setIssues(json?.data ?? []);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  }, [filters, projectId]);

  const createIssue = useCallback(
    async (input: IssueInput) => {
      const res = await fetch(`/api/projects/${projectId}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          description: input.description ?? null,
          state: input.state,
          priority: input.priority,
          assigneeId: input.assigneeId ?? null,
          dueDate: toApiDate(input.dueDate),
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Failed to create issue");
      }

      await fetchIssues();
      return json.data as Issue;
    },
    [fetchIssues, projectId]
  );

  const updateIssue = useCallback(
    async (issueId: string, input: Partial<IssueInput>) => {
      const payload: Record<string, unknown> = {};

      if (Object.prototype.hasOwnProperty.call(input, "title")) {
        payload.title = input.title;
      }
      if (Object.prototype.hasOwnProperty.call(input, "description")) {
        payload.description = input.description ?? null;
      }
      if (Object.prototype.hasOwnProperty.call(input, "state")) {
        payload.state = input.state;
      }
      if (Object.prototype.hasOwnProperty.call(input, "priority")) {
        payload.priority = input.priority;
      }
      if (Object.prototype.hasOwnProperty.call(input, "assigneeId")) {
        payload.assigneeId = input.assigneeId ?? null;
      }
      if (Object.prototype.hasOwnProperty.call(input, "dueDate")) {
        payload.dueDate = toApiDate(input.dueDate);
      }

      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Failed to update issue");
      }

      setIssues((current) => current.map((issue) => (issue.id === issueId ? json.data : issue)));
      return json.data as Issue;
    },
    [projectId]
  );

  const deleteIssue = useCallback(
    async (issueId: string) => {
      const res = await fetch(`/api/projects/${projectId}/issues/${issueId}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Failed to delete issue");
      }

      setIssues((current) => current.filter((issue) => issue.id !== issueId));
    },
    [projectId]
  );

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues,
    loading,
    error,
    refetch: fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue,
  };
}
