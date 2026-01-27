"use client";

import { useState, useEffect, useCallback } from "react";
import type { Thread } from "@/lib/types";

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/threads");
      const json = await res.json();
      if (json.data) {
        setThreads(json.data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch threads");
    } finally {
      setLoading(false);
    }
  }, []);

  const createThread = useCallback(async (title: string) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticThread: Thread = {
      id: tempId,
      title,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setThreads((prev) => [optimisticThread, ...prev]);

    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to create thread");
      }
      // Replace optimistic thread with real one
      setThreads((prev) =>
        prev.map((t) => (t.id === tempId ? json.data : t))
      );
      return json.data;
    } catch (err) {
      // Revert on error
      setThreads((prev) => prev.filter((t) => t.id !== tempId));
      throw err;
    }
  }, []);

  const updateThreadStatus = useCallback(
    async (threadId: string, status: "open" | "closed" | "archived") => {
      // Optimistic update
      const previousThreads = threads;
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, status } : t))
      );

      try {
        const res = await fetch(`/api/threads/${threadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message || "Failed to update thread");
        }
      } catch (err) {
        // Revert on error
        setThreads(previousThreads);
        throw err;
      }
    },
    [threads]
  );

  const deleteThread = useCallback(
    async (threadId: string) => {
      // Optimistic update
      const previousThreads = threads;
      setThreads((prev) => prev.filter((t) => t.id !== threadId));

      try {
        const res = await fetch(`/api/threads/${threadId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message || "Failed to delete thread");
        }
      } catch (err) {
        // Revert on error
        setThreads(previousThreads);
        throw err;
      }
    },
    [threads]
  );

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    loading,
    error,
    refetch: fetchThreads,
    createThread,
    updateThreadStatus,
    deleteThread,
  };
}
