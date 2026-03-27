"use client";

import { Link } from "@/i18n/navigation";

import { cn } from "@/lib/utils";
import type { TaskSprint } from "@amb-app/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SprintBadgeProps = {
  sprint: Pick<TaskSprint, "id" | "name" | "status">;
  statusLabel: string;
  className?: string;
};

export function SprintBadge({ sprint, statusLabel, className }: SprintBadgeProps) {
  const isActive = sprint.status === "ACTIVE";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/tasks/sprints/${sprint.id}`}
          className={cn(
            "inline-flex max-w-full items-center gap-1 rounded-md border-0 bg-muted/50 px-1.5 py-0.5 font-medium text-xs text-muted-foreground transition-all duration-200 motion-safe:hover:-translate-y-px hover:bg-muted hover:shadow-sm",
            isActive && "ring-1 ring-primary/30 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_12%,transparent)]",
            className,
          )}
        >
          {isActive ? (
            <span className="text-primary" aria-hidden>
              ●
            </span>
          ) : null}
          <span className="truncate">{sprint.name}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{sprint.name}</p>
        <p className="text-muted-foreground text-xs">{statusLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}
