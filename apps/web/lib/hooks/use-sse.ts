"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useProjectId } from "@/lib/context/project-context";
import { withProjectId } from "@/lib/api/build-url";

type SSEEvent =
  | { type: "connected"; data: { timestamp: string } }
  | { type: "inbox_counts"; data: Record<string, number> }
  | { type: "dlq_count"; data: { count: number } };

type SSEState = {
  connected: boolean;
  inboxCounts: Record<string, number>;
  dlqCount: number;
};

type UseSSEOptions = {
  enabled?: boolean;
  reconnectInterval?: number;
};

export function useSSE(options: UseSSEOptions = {}) {
  const projectId = useProjectId();
  const { enabled = true, reconnectInterval = 3000 } = options;
  const effectiveEnabled = enabled && projectId != null && projectId.length > 0;

  const [state, setState] = useState<SSEState>({
    connected: false,
    inboxCounts: {},
    dlqCount: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(withProjectId(projectId, "/api/stream"));
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setState((prev) => ({ ...prev, connected: true }));
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEEvent;

        switch (data.type) {
          case "connected":
            setState((prev) => ({ ...prev, connected: true }));
            break;
          case "inbox_counts":
            setState((prev) => ({ ...prev, inboxCounts: data.data }));
            break;
          case "dlq_count":
            setState((prev) => ({ ...prev, dlqCount: data.data.count }));
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      setState((prev) => ({ ...prev, connected: false }));
      eventSource.close();
      eventSourceRef.current = null;

      // Auto-reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        if (effectiveEnabled) {
          connect();
        }
      }, reconnectInterval);
    };
  }, [effectiveEnabled, reconnectInterval, projectId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState((prev) => ({ ...prev, connected: false }));
  }, []);

  useEffect(() => {
    if (effectiveEnabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [effectiveEnabled, connect, disconnect]);

  return {
    ...state,
    reconnect: connect,
    disconnect,
  };
}
