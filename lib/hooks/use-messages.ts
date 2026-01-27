"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Message } from "@/lib/types";

export function useThreadMessages(threadId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!threadId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`);
      const json = await res.json();
      if (json.data) {
        setMessages(json.data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  const sendMessage = useCallback(async (params: {
    fromAgentId: string;
    toAgentId?: string | null;
    payload: unknown;
    parentId?: string | null;
  }) => {
    if (!threadId) return;

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        ...params,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || "Failed to send message");
    }
    await fetchMessages();
    return json.data;
  }, [threadId, fetchMessages]);

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInbox = useCallback(async () => {
    if (!agentId) return;
    
    try {
      const res = await fetch(`/api/messages/inbox?agentId=${agentId}`);
      const json = await res.json();
      if (json.data) {
        setMessages(json.data);
      }
    } catch {
      // Silent fail for polling
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const ackMessage = useCallback(async (messageId: string) => {
    const res = await fetch(`/api/messages/${messageId}/ack`, {
      method: "POST",
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error?.message || "Failed to ack message");
    }
    await fetchInbox();
  }, [fetchInbox]);

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDlq = useCallback(async () => {
    try {
      const res = await fetch("/api/dlq");
      const json = await res.json();
      if (json.data) {
        setMessages(json.data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch DLQ");
    } finally {
      setLoading(false);
    }
  }, []);

  const retryMessage = useCallback(async (messageId: string) => {
    // Optimistic update
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    
    try {
      const res = await fetch(`/api/dlq/${messageId}/retry`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to retry message");
      }
    } catch (err) {
      // Revert on error
      await fetchDlq();
      throw err;
    }
  }, [fetchDlq]);

  const retryAll = useCallback(async () => {
    const previousMessages = messages;
    setMessages([]);
    
    try {
      const res = await fetch("/api/dlq/retry-all", {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to retry all messages");
      }
      return await res.json();
    } catch (err) {
      setMessages(previousMessages);
      throw err;
    }
  }, [messages]);

  useEffect(() => {
    fetchDlq();
  }, [fetchDlq]);

  return { messages, loading, error, refetch: fetchDlq, retryMessage, retryAll };
}
