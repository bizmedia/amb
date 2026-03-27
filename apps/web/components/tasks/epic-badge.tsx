"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { epicDotClass } from "@/lib/epic-colors";
import type { TaskEpic } from "@amb-app/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EpicBadgeProps = {
  epic: Pick<TaskEpic, "id" | "title" | "status">;
  statusLabel: string;
  className?: string;
};

export function EpicBadge({ epic, statusLabel, className }: EpicBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/tasks/epics/${epic.id}`}
          className={cn(
            "inline-flex max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-transparent px-1.5 py-0.5 font-medium text-xs text-muted-foreground transition-all duration-200 motion-safe:hover:-translate-y-px hover:border-primary/35 hover:bg-accent/50 hover:shadow-sm",
            className,
          )}
        >
          <span
            className={cn("size-1.5 shrink-0 rounded-full", epicDotClass(epic.id))}
            aria-hidden
          />
          <span className="truncate">{epic.title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{epic.title}</p>
        <p className="text-muted-foreground text-xs">{statusLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}
