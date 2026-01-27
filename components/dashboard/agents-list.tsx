"use client";

import { useState, useMemo, RefObject } from "react";
import { useAgents } from "@/lib/hooks/use-agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UsersIcon,
  SearchIcon,
  RefreshCwIcon,
  BotIcon,
  WifiIcon,
  WifiOffIcon,
  Loader2Icon,
  AlertCircleIcon,
} from "lucide-react";

type Props = {
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
};

export function AgentsList({ selectedAgentId, onSelectAgent, searchInputRef }: Props) {
  const { agents, loading, error, refetch } = useAgents();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.role.toLowerCase().includes(query)
    );
  }, [agents, searchQuery]);

  const onlineCount = agents.filter((a) => a.status === "online").length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Agents</h2>
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
            <RefreshCwIcon
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin mb-2" />
              <p className="text-sm">Loading agents...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <AlertCircleIcon className="size-6 mb-2" />
              <p className="text-sm font-medium">Failed to load</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="mt-3"
              >
                Try again
              </Button>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BotIcon className="size-10 mb-3 opacity-20" />
              {searchQuery ? (
                <>
                  <p className="text-sm font-medium">No agents found</p>
                  <p className="text-xs mt-1">
                    Try a different search term
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">No agents yet</p>
                  <p className="text-xs mt-1 text-center px-4">
                    Agents will appear here once they connect to the message bus
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAgents.map((agent) => {
                const isOnline = agent.status === "online";
                const isSelected = selectedAgentId === agent.id;

                return (
                  <button
                    key={agent.id}
                    onClick={() => onSelectAgent(agent.id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left transition-all group
                      ${isSelected
                        ? "bg-primary/10 ring-1 ring-primary/20"
                        : "hover:bg-muted/50"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex items-center justify-center size-8 rounded-full shrink-0 ${
                            isOnline
                              ? "bg-green-500/10 text-green-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <BotIcon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {agent.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {agent.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOnline ? (
                          <WifiIcon className="size-3.5 text-green-500" />
                        ) : (
                          <WifiOffIcon className="size-3.5 text-muted-foreground" />
                        )}
                        <Badge
                          variant={isOnline ? "default" : "secondary"}
                          className={`text-[10px] px-1.5 ${
                            isOnline
                              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                              : ""
                          }`}
                        >
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                    {agent.lastSeen && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 pl-10">
                        Last seen: {new Date(agent.lastSeen).toLocaleString()}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
