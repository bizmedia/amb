"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import type { Message } from "@/lib/types";
import { useSSE } from "./use-sse";
import { useProjectId } from "@/lib/context/project-context";
import { withProjectId } from "@/lib/api/build-url";
import { fetchApiData } from "@/lib/api/http";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";

export function useThreadMessages(threadId: string | null) {
  const tCommon = useTranslations("Common");
  const projectId = useProjectId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!threadId) return;
    
    setLoading(true);
    try {
      const data = await fetchApiData<Message[]>(
        withProjectId(projectId, `/api/threads/${threadId}/messages`)
      );
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(getLocalizedApiErrorMessage(err, tCommon));
    } finally {
      setLoading(false);
    }
  }, [threadId, projectId, tCommon]);

  const sendMessage = useCallback(async (params: {
    fromAgentId: string;
    toAgentId?: string | null;
    payload: unknown;
    parentId?: string | null;
  }) => {
    if (!threadId) return;

    const data = await fetchApiData<Message>(withProjectId(projectId, "/api/messages/send"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        ...params,
      }),
    });
    await fetchMessages();
    return data;
  }, [threadId, fetchMessages, projectId]);

  useEffect(() => {
    if (threadId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [threadId, fetchMessages]);

  return { messages, loading, error, refetch: fetchMessages, sendMessage };
}

export function useInbox(agentId: string | null, pollInterval = 3000) {
  const projectId = useProjectId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInbox = useCallback(async () => {
    if (!agentId) return;
    
    try {
      const data = await fetchApiData<Message[]>(
        withProjectId(projectId, `/api/messages/inbox?agentId=${agentId}`)
      );
      setMessages(data);
    } catch {
      // Silent fail for polling
    } finally {
      setLoading(false);
    }
  }, [agentId, projectId]);

  const ackMessage = useCallback(async (messageId: string) => {
    await fetchApiData<Message>(withProjectId(projectId, `/api/messages/${messageId}/ack`), {
      method: "POST",
    });
    await fetchInbox();
  }, [fetchInbox, projectId]);

  useEffect(() => {
    if (agentId) {
      setLoading(true);
      fetchInbox();
      
      intervalRef.current = setInterval(fetchInbox, pollInterval);
    } else {
      setMessages([]);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [agentId, pollInterval, fetchInbox]);

  return { messages, loading, ackMessage, refetch: fetchInbox };
}

export function useDlq() {
  const tCommon = useTranslations("Common");
  const projectId = useProjectId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDlq = useCallback(async () => {
    try {
      const data = await fetchApiData<Message[]>(withProjectId(projectId, "/api/dlq"));
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(getLocalizedApiErrorMessage(err, tCommon));
    } finally {
      setLoading(false);
    }
  }, [projectId, tCommon]);

  const retryMessage = useCallback(async (messageId: string) => {
    // Optimistic update
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    
    try {
      await fetchApiData<Message>(withProjectId(projectId, `/api/dlq/${messageId}/retry`), {
        method: "POST",
      });
    } catch (err) {
      // Revert on error
      await fetchDlq();
      throw err;
    }
  }, [fetchDlq, projectId]);

  const retryAll = useCallback(async () => {
    const previousMessages = messages;
    setMessages([]);
    
    try {
      return await fetchApiData<{ count: number }>(withProjectId(projectId, "/api/dlq/retry-all"), {
        method: "POST",
      });
    } catch (err) {
      setMessages(previousMessages);
      throw err;
    }
  }, [messages, projectId]);

  useEffect(() => {
    fetchDlq();
  }, [fetchDlq]);

  return { messages, loading, error, refetch: fetchDlq, retryMessage, retryAll };
}

export function useAgentInboxCounts() {
  // SSE-based implementation - uses global SSE stream instead of polling
  // agentIds and pollInterval are ignored - SSE provides all counts
  const { inboxCounts, connected } = useSSE();

  return {
    counts: inboxCounts,
    loading: !connected,
    refetch: () => {}, // SSE auto-updates, no manual refetch needed
  };
}

// Re-export useSSE for direct usage
export { useSSE } from "./use-sse";
