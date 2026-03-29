"use client";

import { useTranslations } from "next-intl";
import type { Dispatch, SetStateAction } from "react";

import { Input } from "@amb-app/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@amb-app/ui/components/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DescriptionEditor } from "@/components/ui/description-editor";
import { EpicPicker } from "@/components/tasks/epic-picker";
import { SprintPicker } from "@/components/tasks/sprint-picker";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATES,
  TASK_STATE_LABELS,
} from "@/lib/tasks";
import type { EpicListItem } from "@/lib/hooks/use-epics";
import type { SprintListItem } from "@/lib/hooks/use-sprints";
import type { TaskPriority, TaskState } from "@/lib/types";
import type { TaskFormState } from "../types";
import { UNASSIGNED_SELECT_VALUE } from "../types";

type TaskFormProps = {
  form: TaskFormState;
  setForm: Dispatch<SetStateAction<TaskFormState>>;
  formError: string | null;
  members: Array<{ id: string; name: string }>;
  membersLoading: boolean;
  epics: EpicListItem[];
  epicsLoading: boolean;
  sprints: SprintListItem[];
  sprintsLoading: boolean;
  sprintPickerLabels: { none: string; search: string; empty: string };
};

export function TaskForm({
  form,
  setForm,
  formError,
  members,
  membersLoading,
  epics,
  epicsLoading,
  sprints,
  sprintsLoading,
  sprintPickerLabels,
}: TaskFormProps) {
  const t = useTranslations("Tasks");
  const tEpic = useTranslations("Epics");

  return (
    <div className="space-y-3">
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <Input
        placeholder={t("issueTitlePlaceholder")}
        value={form.title}
        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
      />

      <DescriptionEditor
        value={form.description}
        onChange={(description) => setForm((prev) => ({ ...prev, description }))}
        minHeight="12rem"
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Select
          value={form.state}
          onValueChange={(value) => setForm((prev) => ({ ...prev, state: value as TaskState }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {TASK_STATE_LABELS[state]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={form.priority}
          onValueChange={(value) => setForm((prev) => ({ ...prev, priority: value as TaskPriority }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {TASK_PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={form.assigneeId || UNASSIGNED_SELECT_VALUE}
          onValueChange={(value) =>
            setForm((prev) => ({
              ...prev,
              assigneeId: value === UNASSIGNED_SELECT_VALUE ? "" : (value ?? ""),
            }))
          }
          disabled={membersLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("unassigned")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED_SELECT_VALUE}>{t("unassigned")}</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DatePicker
          value={form.dueDate}
          onChange={(value) => setForm((prev) => ({ ...prev, dueDate: value }))}
          placeholder={t("dueDatePlaceholder")}
        />

        <div className="md:col-span-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{t("epic")}</p>
          <EpicPicker
            value={form.epicId}
            onChange={(epicId) => setForm((prev) => ({ ...prev, epicId }))}
            epics={epics}
            disabled={epicsLoading}
            noneLabel={tEpic("epicNone")}
            searchPlaceholder={tEpic("epicSearchPlaceholder")}
            emptyLabel={tEpic("epicSearchEmpty")}
          />
        </div>

        <div className="md:col-span-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{t("sprint")}</p>
          <SprintPicker
            value={form.sprintId}
            onChange={(sprintId) => setForm((prev) => ({ ...prev, sprintId }))}
            sprints={sprints}
            disabled={sprintsLoading}
            noneLabel={sprintPickerLabels.none}
            searchPlaceholder={sprintPickerLabels.search}
            emptyLabel={sprintPickerLabels.empty}
          />
        </div>
      </div>
    </div>
  );
}
