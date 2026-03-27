import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Shared with Issues filters — keep in sync with task toolbar selects. */
export const tasksFilterSelectClass =
  "h-9 min-w-0 max-w-[11rem] shrink rounded-md border border-border/60 bg-transparent px-2 text-sm text-muted-foreground";

export function TasksWorkspaceFilterDeck({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("tasks-filter-deck px-4 py-3 sm:px-4 sm:py-3", className)}>{children}</div>
  );
}

/** Primary CTA aligned with Issues «Новая задача». */
export const tasksWorkspacePrimaryButtonClass =
  "h-9 w-full shrink-0 gap-2 sm:w-auto sm:min-w-[10rem]";

/**
 * Row: filter deck (flex) + optional right-side actions (e.g. create button).
 * Matches Issues toolbar rhythm (list/kanban row + filter deck).
 */
export function TasksWorkspaceToolRow({
  deck,
  actions,
  className,
}: {
  deck: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-between sm:gap-3",
        className,
      )}
    >
      <div className="min-w-0 flex-1">{deck}</div>
      {actions ? (
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">{actions}</div>
      ) : null}
    </div>
  );
}

export function TasksWorkspaceEmpty({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("tasks-filter-deck p-10 text-center text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export const tasksDetailBackButtonClass =
  "gap-2 px-2 -ml-2 h-8 text-muted-foreground hover:text-foreground";

export function TasksDetailTitleRow({
  title,
  badge,
  meta,
  link,
}: {
  title: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  link?: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h2 className="min-w-0 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        {badge}
      </div>
      {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
      {link}
    </div>
  );
}

export function TasksNestedTableSection({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="tasks-kicker">{title}</h3>
      {children}
    </div>
  );
}
