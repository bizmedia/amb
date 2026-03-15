"use client";

import { useCallback, useEffect, useState } from "react";

import type { Issue, IssuePriority, IssueState } from "@/lib/types";
import { fetchApiData, isAuthError } from "@/lib/api/http";

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
      const data = await fetchApiData<Issue[]>(`/api/projects/${projectId}/issues${query}`);
      setIssues(data);
      setError(null);
    } catch (fetchError) {
      setError(
        isAuthError(fetchError)
          ? "Authentication required. Please log in."
          : fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch issues"
      );
    } finally {
      setLoading(false);
    }
  }, [filters, projectId]);

  const createIssue = useCallback(
    async (input: IssueInput) => {
      const issue = await fetchApiData<Issue>(`/api/projects/${projectId}/issues`, {
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

      await fetchIssues();
      return issue;
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

      const issue = await fetchApiData<Issue>(`/api/projects/${projectId}/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIssues((current) => current.map((currentIssue) => (currentIssue.id === issueId ? issue : currentIssue)));
      return issue;
    },
    [projectId]
  );

  const deleteIssue = useCallback(
    async (issueId: string) => {
      await fetchApiData<{ success: true }>(`/api/projects/${projectId}/issues/${issueId}`, {
        method: "DELETE",
      });

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
