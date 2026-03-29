"use client";

import { useState, useMemo, RefObject } from "react";
import { useTranslations } from "next-intl";
import { useAgents } from "@/lib/hooks/use-agents";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@amb-app/ui/components/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@amb-app/ui/components/dropdown-menu";
import {
  UsersIcon,
  SearchIcon,
  RefreshCwIcon,
  BotIcon,
  WifiIcon,
  WifiOffIcon,
  Loader2Icon,
  AlertCircleIcon,
  MoreVerticalIcon,
  Trash2Icon,
  PencilIcon,
} from "lucide-react";

type Props = {
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  inboxCounts?: Record<string, number>;
};

export function AgentsList({
  selectedAgentId,
  onSelectAgent,
  searchInputRef,
  inboxCounts = {},
}: Props) {
  const t = useTranslations("AgentsList");
  const tCommon = useTranslations("Common");
  const { agents, loading, error, refetch, deleteAgent, updateAgent } = useAgents();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<{ id: string; name: string; role: string } | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const counts = inboxCounts;

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) || agent.role.toLowerCase().includes(query),
    );
  }, [agents, searchQuery]);

  const onlineCount = agents.filter((a) => a.status === "online").length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const openEditDialog = (agent: { id: string; name: string; role: string }) => {
    setAgentToEdit(agent);
    setEditName(agent.name);
    setEditRole(agent.role);
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!agentToEdit) return;
    const name = editName.trim();
    const role = editRole.trim();
    if (!name || !role) {
      setEditError(t("editValidation"));
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      await updateAgent(agentToEdit.id, { name, role });
      setEditDialogOpen(false);
      setAgentToEdit(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const remaining = agents.filter((a) => a.id !== agentToDelete.id);
      await deleteAgent(agentToDelete.id);
      if (selectedAgentId === agentToDelete.id) {
        const next = remaining[0];
        onSelectAgent(next ? next.id : null);
      }
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">{t("agents")}</h2>
            <Badge variant="secondary" className="text-xs">
              {onlineCount}/{agents.length}
            </Badge>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCwIcon className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t("searchAgents")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin mb-2" />
              <p className="text-sm">{t("loadingAgents")}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <AlertCircleIcon className="size-6 mb-2" />
              <p className="text-sm font-medium">{t("failedToLoad")}</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button size="sm" variant="outline" onClick={handleRefresh} className="mt-3">
                {tCommon("tryAgain")}
              </Button>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BotIcon className="size-10 mb-3 opacity-20" />
              {searchQuery ? (
                <>
                  <p className="text-sm font-medium">{t("noAgentsFound")}</p>
                  <p className="text-xs mt-1">{t("tryDifferentSearch")}</p>
                  <Button size="sm" variant="ghost" onClick={() => setSearchQuery("")} className="mt-2">
                    {tCommon("clearSearch")}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">{t("noAgentsYet")}</p>
                  <p className="text-xs mt-1 text-center px-4">{t("agentsAppearHere")}</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAgents.map((agent) => {
                const isOnline = agent.status === "online";
                const isSelected = selectedAgentId === agent.id;

                return (
                  <div
                    key={agent.id}
                    className={`relative rounded-lg px-3 py-2.5 transition-all group ${
                      isSelected ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectAgent(agent.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex items-center justify-center size-8 rounded-full shrink-0 ${
                              isOnline ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <BotIcon className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{agent.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isOnline ? (
                            <WifiIcon className="size-3.5 text-green-500" />
                          ) : (
                            <WifiOffIcon className="size-3.5 text-muted-foreground" />
                          )}
                          {(counts[agent.id] ?? 0) > 0 && (
                            <Badge
                              variant="default"
                              className="text-[10px] px-1.5 h-5 min-w-5 flex items-center justify-center bg-blue-500 text-white"
                            >
                              {(counts[agent.id] ?? 0) > 99 ? "99+" : counts[agent.id]}
                            </Badge>
                          )}
                          <Badge
                            variant={isOnline ? "default" : "secondary"}
                            className={`text-[10px] px-1.5 ${
                              isOnline ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""
                            }`}
                          >
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                      {agent.lastSeen && (
                        <p className="text-[10px] text-muted-foreground mt-1.5 pl-10">
                          {t("lastSeen")}: {new Date(agent.lastSeen).toLocaleString()}
                        </p>
                      )}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute right-1 top-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVerticalIcon className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() =>
                            openEditDialog({ id: agent.id, name: agent.name, role: agent.role })
                          }
                        >
                          <PencilIcon className="size-4 mr-2" />
                          {t("editAgent")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setAgentToDelete({ id: agent.id, name: agent.name });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2Icon className="size-4 mr-2" />
                          {t("deleteAgent")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setAgentToEdit(null);
            setEditError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editAgentTitle")}</DialogTitle>
            <DialogDescription>{t("editAgentDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="agent-edit-name">
                {t("agentName")}
              </label>
              <Input
                id="agent-edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSaveEdit();
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="agent-edit-role">
                {t("agentRole")}
              </label>
              <Input
                id="agent-edit-role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSaveEdit();
                }}
              />
            </div>
            {editError ? <p className="text-sm text-destructive">{editError}</p> : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editSaving}
            >
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={editSaving}>
              {editSaving ? <Loader2Icon className="size-4 animate-spin" /> : tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setAgentToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteAgentTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteAgentConfirm", { name: agentToDelete?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteAgent();
              }}
              disabled={deleting}
            >
              {deleting ? <Loader2Icon className="size-4 animate-spin" /> : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
