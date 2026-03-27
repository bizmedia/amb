export const THREAD_STATUSES = ["open", "closed", "archived"] as const;
export const TASK_STATES = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "DONE",
] as const;
export const TASK_PRIORITIES = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;
