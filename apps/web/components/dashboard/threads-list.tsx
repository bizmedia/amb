"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useThreads } from "@/lib/hooks/use-threads";
import { Badge } from "@amb-app/ui/components/badge";
import { Button } from "@amb-app/ui/components/button";
import { Input } from "@amb-app/ui/components/input";
import { ScrollArea } from "@amb-app/ui/components/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@amb-app/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@amb-app/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@amb-app/ui/components/tooltip";
import {
  MessageSquareIcon,
  PlusIcon,
  SearchIcon,
  RefreshCwIcon,
  MoreVerticalIcon,
  ArchiveIcon,
  CheckCircleIcon,
  CircleIcon,
  Trash2Icon,
  Loader2Icon,
  AlertCircleIcon,
  FilterIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import { ThreadCreateDialog } from "./threads-list/ThreadCreateDialog";

type Props = {
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  externalDialogOpen?: boolean;
  onExternalDialogChange?: (open: boolean) => void;
};

type FilterStatus = "all" | "open" | "closed" | "archived";

export function ThreadsList({ 
  selectedThreadId, 
  onSelectThread,
  externalDialogOpen,
  onExternalDialogChange,
}: Props) {
  const { threads, loading, error, createThread, updateThreadStatus, deleteThread, refetch } = useThreads();
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal
  const dialogOpen = externalDialogOpen ?? internalDialogOpen;
  const setDialogOpen = onExternalDialogChange ?? setInternalDialogOpen;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedThreadId, setCopiedThreadId] = useState<string | null>(null);

  const t = useTranslations("ThreadsList");
  const tCommon = useTranslations("Common");

  const filteredThreads = useMemo(() => {
    let result = threads;

    // Filter by status
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(query));
    }

    return result;
  }, [threads, searchQuery, filterStatus]);

  const statusCounts = useMemo(() => {
    return {
      all: threads.length,
      open: threads.filter((t) => t.status === "open").length,
      closed: threads.filter((t) => t.status === "closed").length,
      archived: threads.filter((t) => t.status === "archived").length,
    };
  }, [threads]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const thread = await createThread(newTitle.trim());
      if (!thread) return;
      setNewTitle("");
      setDialogOpen(false);
      onSelectThread(thread.id);
    } catch {
      // Error handling could be improved with toast
    } finally {
      setCreating(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const handleDelete = async () => {
    if (!threadToDelete) return;
    try {
      await deleteThread(threadToDelete);
      if (selectedThreadId === threadToDelete) {
        onSelectThread(threads.find((t) => t.id !== threadToDelete)?.id || "");
      }
    } finally {
      setDeleteDialogOpen(false);
      setThreadToDelete(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CircleIcon className="size-3 text-green-500" />;
      case "closed":
        return <CheckCircleIcon className="size-3 text-blue-500" />;
      case "archived":
        return <ArchiveIcon className="size-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case "open":
        return "default";
      case "closed":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleCopyTitle = async (title: string, threadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent thread selection
    try {
      await navigator.clipboard.writeText(title);
      setCopiedThreadId(threadId);
      setTimeout(() => setCopiedThreadId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = title;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedThreadId(threadId);
        setTimeout(() => setCopiedThreadId(null), 2000);
      } catch {
        // Ignore
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">{t("threads")}</h2>
            <Badge variant="secondary" className="text-xs">
              {threads.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCwIcon
                className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <ThreadCreateDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title={newTitle}
              setTitle={setNewTitle}
              creating={creating}
              onCreate={handleCreate}
              labels={{
                createNewThread: t("createNewThread"),
                createThreadDesc: t("createThreadDesc"),
                threadTitlePlaceholder: t("threadTitlePlaceholder"),
                cancel: tCommon("cancel"),
                creating: tCommon("creating"),
                createThread: t("createThread"),
              }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("searchThreads")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>

        <div className="flex gap-1">
          {(["all", "open", "closed", "archived"] as FilterStatus[]).map(
            (status) => {
              const labels: Record<FilterStatus, string> = {
                all: t("filterAll"),
                open: t("filterOpen"),
                closed: t("filterClosed"),
                archived: t("filterArchived"),
              };
              return (
                <Button
                  key={status}
                  size="sm"
                  variant={filterStatus === status ? "secondary" : "ghost"}
                  className="h-7 text-xs px-2 gap-1"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "all" && <FilterIcon className="size-3" />}
                  {status === "open" && <CircleIcon className="size-3 text-green-500" />}
                  {status === "closed" && <CheckCircleIcon className="size-3 text-blue-500" />}
                  {status === "archived" && <ArchiveIcon className="size-3" />}
                  <span>{labels[status]}</span>
                  <span className="text-muted-foreground">
                    ({statusCounts[status]})
                  </span>
                </Button>
              );
            }
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin mb-2" />
              <p className="text-sm">{t("loadingThreads")}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <AlertCircleIcon className="size-6 mb-2" />
              <p className="text-sm font-medium">{t("loadError")}</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="mt-3"
              >
                {tCommon("retry")}
              </Button>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquareIcon className="size-10 mb-3 opacity-20" />
              {searchQuery || filterStatus !== "all" ? (
                <>
                  <p className="text-sm font-medium">{t("noThreadsFound")}</p>
                  <p className="text-xs mt-1">{t("tryFilters")}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                    className="mt-2"
                  >
                    {tCommon("resetFilters")}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">{t("noThreadsYet")}</p>
                  <p className="text-xs mt-1 text-center px-4">
                    {t("createFirstThread")}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setDialogOpen(true)}
                    className="mt-3 gap-1.5"
                  >
                    <PlusIcon className="size-4" />
                    {t("createThread")}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredThreads.map((thread) => {
                const isSelected = selectedThreadId === thread.id;
                const isTemp = thread.id.startsWith("temp-");

                return (
                  <div
                    key={thread.id}
                    className={`group relative rounded-lg transition-all
                      ${isSelected
                        ? "bg-primary/10 ring-1 ring-primary/20"
                        : "hover:bg-muted/50"
                      }
                      ${isTemp ? "opacity-60" : ""}`}
                  >
                    <div
                      onClick={() => !isTemp && onSelectThread(thread.id)}
                      className={`w-full px-3 py-2.5 text-left ${isTemp ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getStatusIcon(thread.status)}
                          <span className="font-medium text-sm truncate">
                            {thread.title}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                onClick={(e) => handleCopyTitle(thread.title, thread.id, e)}
                              >
                                {copiedThreadId === thread.id ? (
                                  <CheckIcon className="size-3 text-green-500" />
                                ) : (
                                  <CopyIcon className="size-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {copiedThreadId === thread.id ? tCommon("copied") : tCommon("copyTitle")}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Badge
                          variant={getStatusBadgeVariant(thread.status)}
                          className="text-[10px] px-1.5 shrink-0"
                        >
                          {thread.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 pl-5">
                        {new Date(thread.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Actions dropdown */}
                    {!isTemp && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVerticalIcon className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {thread.status !== "open" && (
                            <DropdownMenuItem
                              onClick={() => updateThreadStatus(thread.id, "open")}
                            >
                              <CircleIcon className="size-4 mr-2 text-green-500" />
                              {t("openAction")}
                            </DropdownMenuItem>
                          )}
                          {thread.status === "open" && (
                            <DropdownMenuItem
                              onClick={() => updateThreadStatus(thread.id, "closed")}
                            >
                              <CheckCircleIcon className="size-4 mr-2 text-blue-500" />
                              {t("closeAction")}
                            </DropdownMenuItem>
                          )}
                          {thread.status !== "archived" && (
                            <DropdownMenuItem
                              onClick={() => updateThreadStatus(thread.id, "archived")}
                            >
                              <ArchiveIcon className="size-4 mr-2" />
                              {t("archiveAction")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setThreadToDelete(thread.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2Icon className="size-4 mr-2" />
                            {t("deleteAction")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteThread")}</DialogTitle>
            <DialogDescription>
              {t("deleteThreadConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
