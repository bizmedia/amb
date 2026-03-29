"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@amb-app/ui/components/select";
import { cn } from "@amb-app/ui/lib/utils";
import type { Dispatch, SetStateAction } from "react";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { TasksWorkspaceFilterDeck } from "@/components/tasks/tasks-workspace-shell";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATES,
  TASK_STATE_LABELS,
} from "@/lib/tasks";
import type { TaskFilters } from "@/lib/hooks/use-tasks";
import type { TaskPriority, TaskState } from "@/lib/types";

const filterTriggerClass =
  "w-full rounded-full border border-border/40 bg-background/70 shadow-none backdrop-blur-sm hover:border-border/70 hover:bg-background focus-visible:border-ring sm:w-auto sm:min-w-[13rem]";

const dateTriggerClass =
  "h-9 min-w-0 max-w-[min(20rem,100%)] shrink-0 justify-start gap-1.5 border-border/60 bg-transparent text-xs sm:max-w-[20rem] sm:text-sm";

type FilterTriggerLabelProps = {
  label: string;
  value: string;
};

function FilterTriggerLabel({ label, value }: FilterTriggerLabelProps) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-sm font-medium">{value}</span>
    </span>
  );
}

type TasksFiltersProps = {
  filters: TaskFilters;
  setFilters: Dispatch<SetStateAction<TaskFilters>>;
  members: Array<{ id: string; name: string }>;
  epics: Array<{ id: string; title: string }>;
  sprints: Array<{ id: string; name: string }>;
  labels: {
    state: string;
    allStates: string;
    priority: string;
    allPriorities: string;
    assignee: string;
    allAssignees: string;
    epic: string;
    allEpics: string;
    sprint: string;
    allSprints: string;
    dueFrom: string;
    dueTo: string;
    dueDateCol: string;
  };
};

export function TasksFilters({
  filters,
  setFilters,
  members,
  epics,
  sprints,
  labels,
}: TasksFiltersProps) {
  return (
    <TasksWorkspaceFilterDeck>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-2 sm:gap-y-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Select
            value={filters.state ?? "ALL"}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, state: value as TaskState | "ALL" }))
            }
          >
            <SelectTrigger className={filterTriggerClass}>
              <FilterTriggerLabel
                label={labels.state}
                value={
                  filters.state && filters.state !== "ALL"
                    ? TASK_STATE_LABELS[filters.state]
                    : labels.allStates
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{labels.allStates}</SelectItem>
              {TASK_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {TASK_STATE_LABELS[state]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priority ?? "ALL"}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, priority: value as TaskPriority | "ALL" }))
            }
          >
            <SelectTrigger className={filterTriggerClass}>
              <FilterTriggerLabel
                label={labels.priority}
                value={
                  filters.priority && filters.priority !== "ALL"
                    ? TASK_PRIORITY_LABELS[filters.priority]
                    : labels.allPriorities
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{labels.allPriorities}</SelectItem>
              {TASK_PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {TASK_PRIORITY_LABELS[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.assigneeId ?? "ALL"}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, assigneeId: value || "ALL" }))}
          >
            <SelectTrigger className={filterTriggerClass}>
              <FilterTriggerLabel
                label={labels.assignee}
                value={
                  filters.assigneeId === "ALL"
                    ? labels.allAssignees
                    : members.find((member) => member.id === filters.assigneeId)?.name ??
                      labels.allAssignees
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{labels.allAssignees}</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.epicId ?? "ALL"}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, epicId: (value || "ALL") as string | "ALL" }))
            }
          >
            <SelectTrigger className={filterTriggerClass}>
              <FilterTriggerLabel
                label={labels.epic}
                value={
                  filters.epicId === "ALL"
                    ? labels.allEpics
                    : epics.find((epic) => epic.id === filters.epicId)?.title ?? labels.allEpics
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{labels.allEpics}</SelectItem>
              {epics.map((epic) => (
                <SelectItem key={epic.id} value={epic.id}>
                  {epic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sprintId ?? "ALL"}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sprintId: (value || "ALL") as string | "ALL" }))
            }
          >
            <SelectTrigger className={filterTriggerClass}>
              <FilterTriggerLabel
                label={labels.sprint}
                value={
                  filters.sprintId === "ALL"
                    ? labels.allSprints
                    : sprints.find((sprint) => sprint.id === filters.sprintId)?.name ??
                      labels.allSprints
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{labels.allSprints}</SelectItem>
              {sprints.map((sprint) => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker
            ariaLabel={`${labels.dueFrom} — ${labels.dueTo}`}
            from={filters.dueFrom ?? ""}
            to={filters.dueTo ?? ""}
            onFromChange={(value) => setFilters((prev) => ({ ...prev, dueFrom: value }))}
            onToChange={(value) => setFilters((prev) => ({ ...prev, dueTo: value }))}
            placeholder={`${labels.dueDateCol} · ${labels.dueFrom} — ${labels.dueTo}`}
            triggerClassName={cn(filterTriggerClass, dateTriggerClass)}
          />
        </div>
      </div>
    </TasksWorkspaceFilterDeck>
  );
}
