"use client";

import type { MutableRefObject } from "react";
import { FileTextIcon, PencilIcon, TrashIcon } from "lucide-react";

import { Badge } from "@amb-app/ui/components/badge";
import { Button } from "@amb-app/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@amb-app/ui/components/select";
import { MarkdownContent } from "@amb-app/ui/components/markdown-content";
import { EpicBadge } from "@/components/tasks/epic-badge";
import { SprintBadge } from "@/components/tasks/sprint-badge";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATES,
  TASK_STATE_LABELS,
} from "@/lib/tasks";
import type { Task, TaskState } from "@/lib/types";
import { assigneeInitials, formatDate } from "../utils/task-formatters";

type TasksKanbanBoardProps = {
  tasks: Task[];
  kanbanMobileColumn: TaskState;
  setKanbanMobileColumn: (value: TaskState) => void;
  kanbanColRefs: MutableRefObject<Partial<Record<TaskState, HTMLDivElement | null>>>;
  onDropToState: (state: TaskState) => void;
  onDragStartTask: (taskId: string) => void;
  onOpenTaskDetails: (task: Task) => void;
  onOpenDescription: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  labels: {
    kanbanColumn: string;
    more: string;
    unassigned: string;
    due: string;
    edit: string;
    delete: string;
  };
  tEpicStatus: (key: string) => string;
  tSprintStatus: (key: string) => string;
};

export function TasksKanbanBoard({
  tasks,
  kanbanMobileColumn,
  setKanbanMobileColumn,
  kanbanColRefs,
  onDropToState,
  onDragStartTask,
  onOpenTaskDetails,
  onOpenDescription,
  onEditTask,
  onDeleteTask,
  labels,
  tEpicStatus,
  tSprintStatus,
}: TasksKanbanBoardProps) {
  return (
    <>
      <div className="mb-3 flex items-center gap-2 lg:hidden" role="toolbar" aria-label={labels.kanbanColumn}>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">{labels.kanbanColumn}</span>
        <Select
          value={kanbanMobileColumn}
          onValueChange={(value) => {
            const state = value as TaskState;
            setKanbanMobileColumn(state);
            requestAnimationFrame(() => {
              kanbanColRefs.current[state]?.scrollIntoView({
                behavior: "smooth",
                inline: "start",
                block: "nearest",
              });
            });
          }}
        >
          <SelectTrigger className="min-w-0 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATES.map((state) => {
              const count = tasks.filter((task) => task.state === state).length;
              return (
                <SelectItem key={state} value={state}>
                  {`${TASK_STATE_LABELS[state]} (${count})`}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="tasks-kanban-scroll -mx-1 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-pb-2 px-1 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible lg:pb-0 lg:snap-none">
        {TASK_STATES.map((state) => {
          const columnTasks = tasks.filter((task) => task.state === state);
          return (
            <div
              key={state}
              ref={(el) => {
                kanbanColRefs.current[state] = el;
              }}
              className="tasks-board-column min-h-[420px] w-[min(20rem,calc(100vw-2.5rem))] shrink-0 snap-start p-3 lg:w-auto lg:min-w-0 lg:shrink"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDropToState(state)}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {TASK_STATE_LABELS[state]}
                </h3>
                <Badge variant="secondary" className="font-mono text-[11px] font-normal tabular-nums">
                  {columnTasks.length}
                </Badge>
              </div>

              <div className="space-y-2.5">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStartTask(task.id)}
                    className="tasks-board-card cursor-pointer p-3 active:cursor-grabbing"
                    onClick={() => onOpenTaskDetails(task)}
                  >
                    <p className="mb-1.5 text-sm leading-snug">
                      {task.key ? (
                        <>
                          <span className="font-mono text-[11px] tabular-nums text-primary/85">{task.key}</span>
                          <span className="text-muted-foreground/80"> · </span>
                        </>
                      ) : null}
                      <span className="font-medium tracking-tight">{task.title}</span>
                    </p>
                    {task.description ? (
                      <div className="mb-2">
                        <MarkdownContent content={task.description} className="text-xs text-muted-foreground" clamped />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1 text-xs"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenDescription(task);
                          }}
                        >
                          <FileTextIcon className="mr-1 size-3" />
                          {labels.more}
                        </Button>
                      </div>
                    ) : null}
                    {task.epic || task.sprint || task.priority !== "NONE" ? (
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        {task.epic ? (
                          <EpicBadge epic={task.epic} statusLabel={tEpicStatus(`status.${task.epic.status}`)} />
                        ) : null}
                        {task.epic && task.sprint ? (
                          <span className="text-xs text-muted-foreground" aria-hidden>
                            ·
                          </span>
                        ) : null}
                        {task.sprint ? (
                          <SprintBadge sprint={task.sprint} statusLabel={tSprintStatus(`status.${task.sprint.status}`)} />
                        ) : null}
                        {task.priority !== "NONE" ? (
                          <Badge variant="outline" className="text-xs font-normal">
                            {TASK_PRIORITY_LABELS[task.priority]}
                          </Badge>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex min-w-0 items-center gap-2">
                        {task.assignee ? (
                          <>
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted/80 text-[9px] font-semibold uppercase shadow-sm">
                              {assigneeInitials(task.assignee.name)}
                            </span>
                            <span className="truncate">{task.assignee.name}</span>
                          </>
                        ) : (
                          <span>{labels.unassigned}</span>
                        )}
                        <span aria-hidden>·</span>
                        <span>
                          {labels.due} {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
