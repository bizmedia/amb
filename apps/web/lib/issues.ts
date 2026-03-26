import type { IssuePriority, IssueState } from "@/lib/types";

export const ISSUE_STATES: IssueState[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "DONE",
];

export const ISSUE_PRIORITIES: IssuePriority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"];

export const ISSUE_STATE_LABELS: Record<IssueState, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = {
  NONE: "None",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};
