import type { TaskPriority, TaskState } from "@/lib/types";

export const TASK_STATES: TaskState[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "DONE",
];

export const TASK_PRIORITIES: TaskPriority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"];

export const TASK_STATE_LABELS: Record<TaskState, string> = {
  BACKLOG: "Backlog",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  NONE: "None",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

/** Full key `PPP-123` → exact `?key=`; otherwise prefix `?search=` on task key. */
export function taskSearchToApiQuery(input: string): { key?: string; search?: string } {
  const t = input.trim().toUpperCase();
  if (!t) {
    return {};
  }
  if (/^[A-Z]{2,5}-\d+$/.test(t)) {
    return { key: t };
  }
  return { search: t };
}
