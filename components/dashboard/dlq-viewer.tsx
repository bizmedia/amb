"use client";

import { useMemo, useState } from "react";
import { useDlq } from "@/lib/hooks/use-messages";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  RefreshCwIcon,
  AlertTriangleIcon,
  RotateCcwIcon,
  BotIcon,
  Loader2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  TargetIcon,
  HashIcon,
  FileJsonIcon,
} from "lucide-react";
import type { Message } from "@/lib/types";

export function DlqViewer() {
  const { messages, loading, error, refetch, retryMessage, retryAll } = useDlq();
  const { agents } = useAgents();
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const [retryingAll, setRetryingAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmRetryAll, setConfirmRetryAll] = useState(false);

  const agentMap = useMemo(
    () => new Map(agents.map((a) => [a.id, a])),
    [agents]
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRetry = async (messageId: string) => {
    setRetryingIds((prev) => new Set(prev).add(messageId));
    try {
      await retryMessage(messageId);
    } finally {
      setRetryingIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  const handleRetryAll = async () => {
    setConfirmRetryAll(false);
    setRetryingAll(true);
    try {
      await retryAll();
    } finally {
      setRetryingAll(false);
    }
  };

  const formatPayload = (payload: unknown): string => {
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  };

  return (
    <div className="h-full rounded-lg border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-destructive/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="size-4 text-destructive" />
            <span className="font-medium text-sm">Очередь ошибок</span>
          </div>
          {messages.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {messages.length} ошибок
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
                  onClick={() => setConfirmRetryAll(true)}
                  disabled={retryingAll}
                  className="gap-1.5 h-7 text-xs border-destructive/30 hover:bg-destructive/10"
                >
                  {retryingAll ? (
                    <Loader2Icon className="size-3 animate-spin" />
                  ) : (
                    <RotateCcwIcon className="size-3" />
                  )}
                  Повторить все
                </Button>
              </TooltipTrigger>
              <TooltipContent>Повторить все неудачные сообщения</TooltipContent>
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
            <TooltipContent>Обновить</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin mb-2" />
              <p className="text-sm">Загрузка...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangleIcon className="size-6 text-destructive mb-2" />
              <p className="text-sm font-medium text-destructive">Ошибка загрузки</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={refetch}
                className="mt-3"
              >
                Повторить
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="relative mb-4">
                <AlertTriangleIcon className="size-12 opacity-20" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
              </div>
              <p className="text-sm font-medium">Ошибок нет</p>
              <p className="text-xs mt-1 text-center">
                Все сообщения успешно обработаны
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const fromAgent = agentMap.get(msg.fromAgentId);
                const toAgent = msg.toAgentId ? agentMap.get(msg.toAgentId) : null;
                const payload = msg.payload as { text?: string } | null;
                const isRetrying = retryingIds.has(msg.id);
                const isExpanded = expandedIds.has(msg.id);

                return (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-destructive/30 bg-destructive/5 overflow-hidden"
                  >
                    {/* Main row */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => toggleExpanded(msg.id)}
                            className="mt-0.5 p-0.5 hover:bg-destructive/10 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronRightIcon className="size-4 text-muted-foreground" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            {/* Agents */}
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`flex items-center justify-center size-6 rounded-full ${
                                    fromAgent?.status === "online"
                                      ? "bg-green-500/10 text-green-600"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <BotIcon className="size-3" />
                                </div>
                                <span className="text-sm font-medium">
                                  {fromAgent?.name || msg.fromAgentId.slice(0, 8)}
                                </span>
                              </div>
                              {toAgent && (
                                <>
                                  <span className="text-muted-foreground">→</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex items-center justify-center size-6 rounded-full bg-muted text-muted-foreground">
                                      <TargetIcon className="size-3" />
                                    </div>
                                    <span className="text-sm">
                                      {toAgent.name}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Message preview */}
                            <p className="text-sm text-muted-foreground truncate">
                              {payload?.text || JSON.stringify(msg.payload).slice(0, 100)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="destructive" className="text-[10px]">
                            {msg.retries} попыток
                          </Badge>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetry(msg.id)}
                                disabled={isRetrying}
                                className="gap-1.5 h-7 text-xs"
                              >
                                {isRetrying ? (
                                  <Loader2Icon className="size-3 animate-spin" />
                                ) : (
                                  <RotateCcwIcon className="size-3" />
                                )}
                                Повторить
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Повторить это сообщение</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1.5 mt-2 ml-7 text-xs text-muted-foreground">
                        <ClockIcon className="size-3" />
                        <span>
                          Ошибка: {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-destructive/20 p-4 bg-background/50 space-y-3">
                        <div className="grid gap-3 text-xs">
                          <div className="flex items-start gap-2">
                            <HashIcon className="size-3.5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-muted-foreground">ID сообщения</p>
                              <p className="font-mono">{msg.id}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <HashIcon className="size-3.5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-muted-foreground">ID треда</p>
                              <p className="font-mono">{msg.threadId}</p>
                            </div>
                          </div>

                          {msg.parentId && (
                            <div className="flex items-start gap-2">
                              <HashIcon className="size-3.5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-muted-foreground">ID родительского сообщения</p>
                                <p className="font-mono">{msg.parentId}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-2">
                            <FileJsonIcon className="size-3.5 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-muted-foreground mb-1">Содержимое</p>
                              <pre className="bg-muted/50 rounded p-2 overflow-x-auto text-[11px] font-mono whitespace-pre-wrap break-all">
                                {formatPayload(msg.payload)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Info footer */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground text-center">
          Сообщения в очереди ошибок превысили максимальное число попыток (3)
        </div>
      )}

      {/* Confirm retry all dialog */}
      <Dialog open={confirmRetryAll} onOpenChange={setConfirmRetryAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcwIcon className="size-5" />
              Повторить все сообщения
            </DialogTitle>
            <DialogDescription>
              Это вернёт все {messages.length} сообщений из очереди ошибок
              в статус ожидания. Они будут обработаны снова со сброшенными счётчиками.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRetryAll(false)}>
              Отмена
            </Button>
            <Button onClick={handleRetryAll}>
              Повторить все ({messages.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
