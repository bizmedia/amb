import type { Task, TaskPriority, TaskState } from "@/lib/types";
import type { TaskListSort, TaskListSortColumn } from "../types";

const priorityRank: Record<TaskPriority, number> = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
};

const TASK_STATE_ORDER: Record<TaskState, number> = {
  BACKLOG: 0,
  TODO: 1,
  IN_PROGRESS: 2,
  DONE: 3,
};

/** Default: due date ascending (soonest first; tasks without due date last). */
export const defaultTaskListSort: TaskListSort = { column: "dueDate", direction: "asc" };

export function defaultSortDirection(column: TaskListSortColumn): "asc" | "desc" {
  if (column === "priority") {
    return "desc";
  }
  return "asc";
}

export function compareTasksBySort(a: Task, b: Task, sort: TaskListSort): number {
  const asc = sort.direction === "asc" ? 1 : -1;

  switch (sort.column) {
    case "key": {
      const ka = a.key ?? "";
      const kb = b.key ?? "";
      if (!ka && !kb) return 0;
      if (!ka) return 1;
      if (!kb) return -1;
      return ka.localeCompare(kb, undefined, { numeric: true, sensitivity: "base" }) * asc;
    }
    case "title":
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" }) * asc;
    case "state":
      return (TASK_STATE_ORDER[a.state] - TASK_STATE_ORDER[b.state]) * asc;
    case "priority":
      return (priorityRank[a.priority] - priorityRank[b.priority]) * asc;
    case "epic": {
      const ea = a.epic?.title;
      const eb = b.epic?.title;
      if (!ea && !eb) return 0;
      if (!ea) return 1;
      if (!eb) return -1;
      return ea.localeCompare(eb, undefined, { sensitivity: "base" }) * asc;
    }
    case "sprint": {
      const sa = a.sprint?.name;
      const sb = b.sprint?.name;
      if (!sa && !sb) return 0;
      if (!sa) return 1;
      if (!sb) return -1;
      return sa.localeCompare(sb, undefined, { sensitivity: "base" }) * asc;
    }
    case "assignee": {
      const aa = a.assignee?.name;
      const ab = b.assignee?.name;
      if (!aa && !ab) return 0;
      if (!aa) return 1;
      if (!ab) return -1;
      return aa.localeCompare(ab, undefined, { sensitivity: "base" }) * asc;
    }
    case "dueDate": {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const aT = new Date(a.dueDate).getTime();
      const bT = new Date(b.dueDate).getTime();
      return (aT - bT) * asc;
    }
    default:
      return 0;
  }
}
