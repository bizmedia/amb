"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  CalendarClockIcon,
  CalendarRangeIcon,
  CircleDotIcon,
  FlagIcon,
  LayersIcon,
  PencilIcon,
  TrashIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@amb-app/ui/components/badge";
import { Button } from "@amb-app/ui/components/button";
import { MarkdownContent } from "@amb-app/ui/components/markdown-content";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@amb-app/ui/components/sheet";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATE_LABELS,
} from "@/lib/tasks";
import type { Task } from "@/lib/types";
import { formatDate } from "../utils/task-formatters";

type TaskDetailsSheetProps = {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  labels: {
    unassigned: string;
    issue: string;
    noDescription: string;
    actions: string;
    state: string;
    priority: string;
    assignee: string;
    epic: string;
    sprint: string;
    dueDate: string;
    open: string;
    refresh: string;
    edit: string;
    delete: string;
  };
};

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="text-muted-foreground/80">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

const TASK_SHEET_WIDTH_KEY = "tasks:detail-sheet-width";
const MIN_SHEET_WIDTH = 560;
const DEFAULT_SHEET_WIDTH = 760;

function clampSheetWidth(width: number, viewportWidth: number) {
  const max = Math.max(MIN_SHEET_WIDTH, viewportWidth - 160);
  return Math.min(Math.max(width, MIN_SHEET_WIDTH), max);
}

function getInitialSheetWidth() {
  if (typeof window === "undefined") {
    return DEFAULT_SHEET_WIDTH;
  }

  const stored = window.localStorage.getItem(TASK_SHEET_WIDTH_KEY);
  if (!stored) {
    return clampSheetWidth(Math.round(window.innerWidth / 2), window.innerWidth);
  }

  const parsed = Number(stored);
  if (Number.isFinite(parsed)) {
    return clampSheetWidth(parsed, window.innerWidth);
  }

  return DEFAULT_SHEET_WIDTH;
}

export function TaskDetailsSheet({
  task,
  onClose,
  onEdit,
  onDelete,
  labels,
}: TaskDetailsSheetProps) {
  const [sheetWidth, setSheetWidth] = useState(getInitialSheetWidth);
  const [isResizing, setIsResizing] = useState(false);
  const currentWidthRef = useRef(DEFAULT_SHEET_WIDTH);

  useEffect(() => {
    currentWidthRef.current = sheetWidth;
  }, [sheetWidth]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setSheetWidth((current) => clampSheetWidth(current, window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sheetStyle = useMemo<CSSProperties>(
    () => ({
      ["--task-sheet-width" as string]: `min(${sheetWidth}px, calc(100vw - 1.5rem))`,
    }),
    [sheetWidth],
  );

  const beginResize = () => {
    if (typeof window === "undefined") {
      return;
    }

    setIsResizing(true);

    const handlePointerMove = (event: PointerEvent) => {
      const nextWidth = clampSheetWidth(window.innerWidth - event.clientX, window.innerWidth);
      setSheetWidth(nextWidth);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      window.localStorage.setItem(TASK_SHEET_WIDTH_KEY, String(currentWidthRef.current));
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  return (
    <Sheet open={Boolean(task)} onOpenChange={(open) => (open ? null : onClose())}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden border-l border-border/60 bg-background p-0 data-[side=right]:md:w-[var(--task-sheet-width)] data-[side=right]:md:max-w-none"
        style={sheetStyle}
      >
        {task ? (
          <>
            <div
              className="absolute top-0 left-0 z-20 hidden h-full w-2 -translate-x-1/2 cursor-col-resize md:block"
              onPointerDown={beginResize}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize task details panel"
            >
              <div
                className={`absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-border/70 transition-colors ${
                  isResizing ? "bg-primary" : ""
                }`}
              />
            </div>

            <div className="pointer-events-none absolute top-4 right-4 z-10">
              <SheetClose
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="pointer-events-auto rounded-full border border-border/60 bg-background/90 backdrop-blur-sm"
                  />
                }
              >
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>

            <SheetHeader className="border-b border-border/60 bg-muted/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-[11px] tracking-tight">
                        {task.key ?? labels.issue}
                      </Badge>
                      <Badge variant="outline" className="font-normal">
                        {TASK_STATE_LABELS[task.state]}
                      </Badge>
                      {task.priority !== "NONE" ? (
                        <Badge variant="outline" className="font-normal">
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <SheetTitle className="text-pretty text-2xl leading-tight tracking-tight">
                        {task.title}
                      </SheetTitle>
                      <SheetDescription className="flex items-center gap-2">
                        <UserRoundIcon className="size-4" />
                        <span>{task.assignee?.name ?? labels.unassigned}</span>
                      </SheetDescription>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pr-10">
                    <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                      <PencilIcon className="size-4" />
                      {labels.edit}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(task)}
                    >
                      <TrashIcon className="size-4" />
                      {labels.delete}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <DetailCard
                    icon={<CircleDotIcon className="size-3.5" />}
                    label={labels.state}
                    value={TASK_STATE_LABELS[task.state]}
                  />
                  <DetailCard
                    icon={<FlagIcon className="size-3.5" />}
                    label={labels.priority}
                    value={task.priority === "NONE" ? "—" : TASK_PRIORITY_LABELS[task.priority]}
                  />
                  <DetailCard
                    icon={<LayersIcon className="size-3.5" />}
                    label={labels.epic}
                    value={task.epic?.title ?? "—"}
                  />
                  <DetailCard
                    icon={<CalendarRangeIcon className="size-3.5" />}
                    label={labels.sprint}
                    value={task.sprint?.name ?? "—"}
                  />
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="space-y-5">
                  <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {labels.issue}
                      </p>
                      {task.key ? (
                        <span className="font-mono text-xs tracking-tight text-muted-foreground">
                          {task.key}
                        </span>
                      ) : null}
                    </div>

                    {task.description ? (
                      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                        <MarkdownContent content={task.description} className="text-sm leading-7" />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-5 py-8 text-sm text-muted-foreground">
                        {labels.noDescription}
                      </div>
                    )}
                  </section>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {labels.actions}
                    </p>

                    <div className="space-y-3">
                      <DetailCard
                        icon={<UserRoundIcon className="size-3.5" />}
                        label={labels.assignee}
                        value={task.assignee?.name ?? labels.unassigned}
                      />
                      <DetailCard
                        icon={<CalendarClockIcon className="size-3.5" />}
                        label={labels.dueDate}
                        value={formatDate(task.dueDate)}
                      />
                      <DetailCard
                        icon={<CalendarClockIcon className="size-3.5" />}
                        label={labels.open}
                        value={formatDate(task.createdAt)}
                      />
                      <DetailCard
                        icon={<CalendarClockIcon className="size-3.5" />}
                        label={labels.refresh}
                        value={formatDate(task.updatedAt)}
                      />
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
