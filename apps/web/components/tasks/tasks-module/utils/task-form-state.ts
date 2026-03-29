import type { Task } from "@/lib/types";
import type { TaskFormState } from "../types";

export function toTaskFormState(task: Task): TaskFormState {
  return {
    title: task.title,
    description: task.description ?? "",
    state: task.state,
    priority: task.priority,
    assigneeId: task.assigneeId ?? "",
    epicId: task.epicId ?? "",
    sprintId: task.sprintId ?? "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
  };
}
