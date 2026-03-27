"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import type { Task, TaskPriority, TaskState } from "@/lib/types";
import { fetchApiData } from "@/lib/api/http";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";

export type TaskFilters = {
  state?: TaskState | "ALL";
  priority?: TaskPriority | "ALL";
  assigneeId?: string | "ALL";
  epicId?: string | "ALL";
  sprintId?: string | "ALL";
  dueFrom?: string;
  dueTo?: string;
  /** Exact task key (mutually exclusive with keySearchPrefix in UI). */
  key?: string;
  /** Prefix match on task key. */
  search?: string;
};

export type TaskInput = {
  title: string;
  description?: string | null;
  state?: TaskState;
  priority?: TaskPriority;
  assigneeId?: string | null;
  epicId?: string | null;
  sprintId?: string | null;
  dueDate?: string | null;
};

function buildTaskQuery(filters: TaskFilters): string {
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
  if (filters.epicId && filters.epicId !== "ALL") {
    params.set("epicId", filters.epicId);
  }
  if (filters.sprintId && filters.sprintId !== "ALL") {
    params.set("sprintId", filters.sprintId);
  }
  if (filters.dueFrom) {
    params.set("dueFrom", filters.dueFrom);
  }
  if (filters.dueTo) {
    params.set("dueTo", filters.dueTo);
  }
  if (filters.key) {
    params.set("key", filters.key);
  } else if (filters.search && filters.search.trim()) {
    params.set("search", filters.search.trim());
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

export function useTasks(projectId: string, filters: TaskFilters) {
  const tCommon = useTranslations("Common");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);

    try {
      const query = buildTaskQuery(filters);
      const data = await fetchApiData<Task[]>(`/api/projects/${projectId}/tasks${query}`);
      setTasks(data);
      setError(null);
    } catch (fetchError) {
      setError(getLocalizedApiErrorMessage(fetchError, tCommon));
    } finally {
      setLoading(false);
    }
  }, [filters, projectId, tCommon]);

  const createTask = useCallback(
    async (input: TaskInput) => {
      const task = await fetchApiData<Task>(`/api/projects/${projectId}/tasks`, {
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

      if (input.epicId || input.sprintId) {
        const patch: Record<string, string> = {};
        if (input.epicId) patch.epicId = input.epicId;
        if (input.sprintId) patch.sprintId = input.sprintId;
        await fetchApiData<Task>(`/api/projects/${projectId}/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      }

      await fetchTasks();
      return task;
    },
    [fetchTasks, projectId]
  );

  const updateTask = useCallback(
    async (taskId: string, input: Partial<TaskInput>) => {
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
      if (Object.prototype.hasOwnProperty.call(input, "epicId")) {
        payload.epicId = input.epicId ?? null;
      }
      if (Object.prototype.hasOwnProperty.call(input, "sprintId")) {
        payload.sprintId = input.sprintId ?? null;
      }

      const task = await fetchApiData<Task>(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setTasks((current) => current.map((t) => (t.id === taskId ? task : t)));
      return task;
    },
    [projectId]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      await fetchApiData<{ success: true }>(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      });

      setTasks((current) => current.filter((t) => t.id !== taskId));
    },
    [projectId]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
