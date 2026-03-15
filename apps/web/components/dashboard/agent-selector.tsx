"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BotIcon, ChevronDownIcon, XIcon, AtSignIcon } from "lucide-react";
import type { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelect: (agent: Agent | null) => void;
  disabled?: boolean;
  currentAgentId?: string | null;
};

export function AgentSelector({
  agents,
  selectedAgent,
  onSelect,
  disabled,
  currentAgentId,
}: Props) {
  const t = useTranslations("AgentSelector");
  const availableAgents = currentAgentId
    ? agents.filter((a) => a.id !== currentAgentId)
    : agents;

  return (
    <div className="flex items-center gap-1">
      {selectedAgent ? (
        <Badge
          variant="secondary"
          className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
          onClick={() => !disabled && onSelect(null)}
        >
          <AtSignIcon className="size-3" />
          {selectedAgent.role}
          <Button
            size="icon"
            variant="ghost"
            className="size-4 ml-1 hover:bg-destructive/20"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
            disabled={disabled}
          >
            <XIcon className="size-3" />
          </Button>
        </Badge>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1 text-xs"
              disabled={disabled}
            >
              <AtSignIcon className="size-3.5" />
              <span className="hidden sm:inline">{t("to")}</span>
              <ChevronDownIcon className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>{t("selectRecipient")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableAgents.map((agent) => (
              <DropdownMenuItem
                key={agent.id}
                onClick={() => onSelect(agent)}
                className="cursor-pointer"
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-6 rounded-full mr-2",
                    agent.status === "online"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <BotIcon className="size-3.5" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">@{agent.role}</span>
                  <span className="text-xs text-muted-foreground">
                    {agent.name}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            {availableAgents.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                {t("noAgentsAvailable")}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
