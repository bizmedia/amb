"use client";

import { useMemo, useState } from "react";
import { useInbox } from "@/lib/hooks/use-messages";
import { useAgents } from "@/lib/hooks/use-agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCwIcon,
  InboxIcon,
  CheckIcon,
  CheckCheckIcon,
  BotIcon,
  Loader2Icon,
  MailIcon,
  ClockIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { JsonViewer } from "@/components/ui/json-viewer";

type Props = {
  agentId: string | null;
};

const statusConfig = {
  pending: {
    icon: ClockIcon,
    color: "text-yellow-500",
    label: "Pending",
    variant: "outline" as const,
  },
  delivered: {
    icon: CheckIcon,
    color: "text-blue-500",
    label: "Delivered",
    variant: "secondary" as const,
  },
  ack: {
    icon: CheckCheckIcon,
    color: "text-green-500",
    label: "Acknowledged",
    variant: "default" as const,
  },
  dlq: {
    icon: AlertTriangleIcon,
    color: "text-destructive",
    label: "Failed",
    variant: "destructive" as const,
  },
};

export function InboxViewer({ agentId }: Props) {
  const { messages, loading, ackMessage, refetch } = useInbox(agentId);
  const { agents } = useAgents();
  const [ackingIds, setAckingIds] = useState<Set<string>>(new Set());
  const [ackingAll, setAckingAll] = useState(false);

  const agentMap = useMemo(
    () => new Map(agents.map((a) => [a.id, a])),
    [agents]
  );
  const currentAgent = agentId ? agentMap.get(agentId) : null;

  const handleAck = async (messageId: string) => {
    setAckingIds((prev) => new Set(prev).add(messageId));
    try {
      await ackMessage(messageId);
    } finally {
      setAckingIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  const handleAckAll = async () => {
    if (messages.length === 0) return;
    
    setAckingAll(true);
    try {
      // Acknowledge all messages sequentially
      for (const msg of messages) {
        await ackMessage(msg.id);
      }
    } finally {
      setAckingAll(false);
    }
  };

  if (!agentId) {
    return (
      <div className="h-full rounded-lg border bg-card flex flex-col items-center justify-center text-muted-foreground">
        <InboxIcon className="size-12 mb-4 opacity-20" />
        <p className="font-medium">No agent selected</p>
        <p className="text-sm mt-1">Select an agent to view their inbox</p>
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <InboxIcon className="size-4 text-muted-foreground" />
            <span className="font-medium text-sm">Inbox</span>
          </div>
          {currentAgent && (
            <Badge variant="outline" className="gap-1 text-xs">
              <BotIcon className="size-3" />
              {currentAgent.name}
            </Badge>
          )}
          {messages.length > 0 && (
            <Badge variant="default" className="text-xs">
              {messages.length} unread
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAckAll}
                  disabled={ackingAll}
                  className="gap-1.5 h-7 text-xs"
                >
                  {ackingAll ? (
                    <Loader2Icon className="size-3 animate-spin" />
                  ) : (
                    <CheckCheckIcon className="size-3" />
                  )}
                  Ack All
                </Button>
              </TooltipTrigger>
              <TooltipContent>Acknowledge all messages</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={refetch}
              >
                <RefreshCwIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh inbox</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 h-0">
        <div className="p-4">
          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin mb-2" />
              <p className="text-sm">Loading inbox...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MailIcon className="size-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">Inbox is empty</p>
              <p className="text-xs mt-1 text-center">
                New messages addressed to {currentAgent?.name || "this agent"} will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const fromAgent = agentMap.get(msg.fromAgentId);
                const payload = msg.payload as { text?: string } | null;
                const isAcking = ackingIds.has(msg.id);

                return (
                  <div
                    key={msg.id}
                    className="group rounded-lg border bg-background p-4 transition-all hover:shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex items-center justify-center size-8 rounded-full ${
                            fromAgent?.status === "online"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <BotIcon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {fromAgent?.name || msg.fromAgentId.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fromAgent?.role || "Unknown role"}
                          </p>
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAck(msg.id)}
                            disabled={isAcking}
                            className="gap-1.5 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {isAcking ? (
                              <Loader2Icon className="size-3 animate-spin" />
                            ) : (
                              <CheckIcon className="size-3" />
                            )}
                            Acknowledge
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark as read</TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Content */}
                    <div className="rounded-md bg-muted/50 p-3 mb-3">
                      {payload?.text ? (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {payload.text}
                        </p>
                      ) : (
                        <div className="text-sm">
                          <JsonViewer data={msg.payload} />
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="size-3" />
                        <span>
                          {new Date(msg.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {msg.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with polling indicator */}
      <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Auto-refreshing every 3 seconds
      </div>
    </div>
  );
}
