"use client";

import type { TaskPriority, TaskState } from "@/lib/types";

export type ViewMode = "list" | "kanban";

export type TaskFormState = {
  title: string;
  description: string;
  state: TaskState;
  priority: TaskPriority;
  assigneeId: string;
  epicId: string;
  sprintId: string;
  dueDate: string;
};

export const defaultTaskForm: TaskFormState = {
  title: "",
  description: "",
  state: "BACKLOG",
  priority: "NONE",
  assigneeId: "",
  epicId: "",
  sprintId: "",
  dueDate: "",
};

export const UNASSIGNED_SELECT_VALUE = "__unassigned__";

export type TaskListSortColumn =
  | "key"
  | "title"
  | "state"
  | "priority"
  | "epic"
  | "sprint"
  | "assignee"
  | "dueDate";

export type TaskListSort = { column: TaskListSortColumn; direction: "asc" | "desc" };
