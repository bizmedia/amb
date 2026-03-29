"use client";

import type { CSSProperties } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckIcon,
  CopyIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";

import { Badge } from "@amb-app/ui/components/badge";
import { Button } from "@amb-app/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@amb-app/ui/components/table";
import { cn } from "@amb-app/ui/lib/utils";
import { EpicBadge } from "@/components/tasks/epic-badge";
import { SprintBadge } from "@/components/tasks/sprint-badge";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATE_LABELS,
} from "@/lib/tasks";
import type { Task } from "@/lib/types";
import type { TaskListSort, TaskListSortColumn } from "../types";
import { assigneeInitials, formatDate } from "../utils/task-formatters";

type SortableThProps = {
  column: TaskListSortColumn;
  label: string;
  sort: TaskListSort;
  onSort: (c: TaskListSortColumn) => void;
  toggleSortLabel: string;
  className?: string;
};

function SortableTh({
  column,
  label,
  sort,
  onSort,
  toggleSortLabel,
  className,
}: SortableThProps) {
  const active = sort.column === column;
  const ariaSort =
    active && sort.direction === "asc"
      ? "ascending"
      : active && sort.direction === "desc"
        ? "descending"
        : "none";

  return (
    <TableHead className={cn("px-3", className)} aria-sort={ariaSort}>
      <button
        type="button"
        className={cn(
          "group inline-flex min-h-9 w-full max-w-full items-center gap-1.5 rounded-md px-1 py-1 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-muted/60 hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
        onClick={() => onSort(column)}
        aria-label={`${label}. ${toggleSortLabel}`}
      >
        <span className="select-none">{label}</span>
        <span className="inline-flex size-4 shrink-0 items-center justify-center">
          {active ? (
            sort.direction === "asc" ? (
              <ArrowUp className="size-3.5 opacity-90" aria-hidden />
            ) : (
              <ArrowDown className="size-3.5 opacity-90" aria-hidden />
            )
          ) : (
            <ArrowUpDown className="size-3.5 opacity-35 group-hover:opacity-60" aria-hidden />
          )}
        </span>
      </button>
    </TableHead>
  );
}

type TasksListTableProps = {
  tasks: Task[];
  sort: TaskListSort;
  onSort: (column: TaskListSortColumn) => void;
  toggleSortLabel: string;
  labels: {
    taskKey: string;
    issue: string;
    state: string;
    priority: string;
    epic: string;
    sprint: string;
    assignee: string;
    dueDate: string;
    actions: string;
    copyTaskKey: string;
    edit: string;
    delete: string;
  };
  tEpicStatus: (key: string) => string;
  tSprintStatus: (key: string) => string;
  copiedTaskKeyId: string | null;
  onCopyTaskKey: (task: Task) => Promise<void> | void;
  onOpenTaskDetails: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
};

export function TasksListTable({
  tasks,
  sort,
  onSort,
  toggleSortLabel,
  labels,
  tEpicStatus,
  tSprintStatus,
  copiedTaskKeyId,
  onCopyTaskKey,
  onOpenTaskDetails,
  onEditTask,
  onDeleteTask,
}: TasksListTableProps) {
  return (
    <div className="tasks-data-table-wrap">
      <Table className="tasks-data-table min-w-[1000px]">
        <TableHeader className="tasks-table-head">
          <TableRow className="text-left hover:bg-transparent">
            <SortableTh
              column="key"
              label={labels.taskKey}
              sort={sort}
              onSort={onSort}
              toggleSortLabel={toggleSortLabel}
              className="whitespace-nowrap"
            />
            <SortableTh column="title" label={labels.issue} sort={sort} onSort={onSort} toggleSortLabel={toggleSortLabel} />
            <SortableTh column="state" label={labels.state} sort={sort} onSort={onSort} toggleSortLabel={toggleSortLabel} />
            <SortableTh column="priority" label={labels.priority} sort={sort} onSort={onSort} toggleSortLabel={toggleSortLabel} />
            <SortableTh column="epic" label={labels.epic} sort={sort} onSort={onSort} toggleSortLabel={toggleSortLabel} />
            <SortableTh column="sprint" label={labels.sprint} sort={sort} onSort={onSort} toggleSortLabel={toggleSortLabel} />
            <SortableTh column="assignee" label={labels.assignee} sort={sort} onSort={onSort} toggleSortLabel={toggleSortLabel} />
            <SortableTh column="dueDate" label={labels.dueDate} sort={sort} onSort={onSort} toggleSortLabel={toggleSortLabel} />
            <TableHead className="px-3 py-2.5 text-muted-foreground">{labels.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, rowIndex) => (
            <TableRow
              key={task.id}
              className="tasks-table-row cursor-pointer"
              style={{ "--stagger": Math.min(rowIndex * 22, 440) } as CSSProperties}
              onClick={() => onOpenTaskDetails(task)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenTaskDetails(task);
                }
              }}
              tabIndex={0}
              aria-label={task.key ? `${task.key} ${task.title}` : task.title}
            >
              <TableCell className="whitespace-nowrap px-3 py-2 align-top">
                {task.key ? (
                  <div className="flex items-center gap-0.5">
                    <span className="font-mono text-[11px] tabular-nums tracking-tight text-primary/85">
                      {task.key}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                      title={labels.copyTaskKey}
                      aria-label={labels.copyTaskKey}
                      onClick={(event) => {
                        event.stopPropagation();
                        void onCopyTaskKey(task);
                      }}
                    >
                      {copiedTaskKeyId === task.id ? (
                        <CheckIcon className="size-3.5 text-primary" />
                      ) : (
                        <CopyIcon className="size-3.5" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="max-w-[min(420px,40vw)] whitespace-normal px-3 py-2 align-top">
                <p className="text-sm font-medium leading-snug tracking-tight">{task.title}</p>
              </TableCell>
              <TableCell className="px-3 py-2 align-top">
                <Badge variant="outline" className="font-normal">
                  {TASK_STATE_LABELS[task.state]}
                </Badge>
              </TableCell>
              <TableCell className="px-3 py-2 align-top">
                {task.priority === "NONE" ? (
                  <span className="text-xs text-muted-foreground">—</span>
                ) : (
                  <Badge variant="outline" className="font-normal">
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="px-3 py-2 align-top">
                {task.epic ? <EpicBadge epic={task.epic} statusLabel={tEpicStatus(`status.${task.epic.status}`)} /> : null}
              </TableCell>
              <TableCell className="px-3 py-2 align-top">
                {task.sprint ? (
                  <SprintBadge sprint={task.sprint} statusLabel={tSprintStatus(`status.${task.sprint.status}`)} />
                ) : null}
              </TableCell>
              <TableCell className="px-3 py-2 align-top">
                {task.assignee ? (
                  <div className="flex max-w-[180px] items-center gap-2">
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border/50 bg-gradient-to-br from-muted to-muted/60 text-[10px] font-semibold uppercase text-muted-foreground shadow-sm"
                      title={task.assignee.name}
                    >
                      {assigneeInitials(task.assignee.name)}
                    </span>
                    <span className="truncate text-sm">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                {formatDate(task.dueDate)}
              </TableCell>
              <TableCell className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={labels.edit}
                    title={labels.edit}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditTask(task);
                    }}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={labels.delete}
                    title={labels.delete}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                  >
                    <TrashIcon className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
