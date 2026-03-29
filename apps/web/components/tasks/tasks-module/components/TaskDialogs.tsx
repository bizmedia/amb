"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@amb-app/ui/components/dialog";
import { Button } from "@amb-app/ui/components/button";
import { MarkdownContent } from "@amb-app/ui/components/markdown-content";
import type { Dispatch, SetStateAction } from "react";
import type { EpicListItem } from "@/lib/hooks/use-epics";
import type { SprintListItem } from "@/lib/hooks/use-sprints";
import type { Task } from "@/lib/types";
import type { TaskFormState } from "../types";
import { TaskForm } from "./TaskForm";

type TaskDialogsProps = {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  editingTask: Task | null;
  onEditOpenChange: (open: boolean) => void;
  viewDescriptionTask: Task | null;
  onViewDescriptionOpenChange: (open: boolean) => void;
  deleteTaskId: string | null;
  onDeleteOpenChange: (open: boolean) => void;
  onCloseDialogs: () => void;
  onCancelDelete: () => void;
  onSubmitCreate: () => void;
  onSubmitEdit: () => void;
  onConfirmDelete: () => void;
  submitting: boolean;
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
  labels: {
    createIssue: string;
    createIssueDesc: string;
    editIssue: string;
    editIssueDesc: string;
    noDescription: string;
    deleteIssue: string;
    deleteIssueDesc: string;
    create: string;
    save: string;
    cancel: string;
    delete: string;
  };
};

export function TaskDialogs({
  createOpen,
  onCreateOpenChange,
  editingTask,
  onEditOpenChange,
  viewDescriptionTask,
  onViewDescriptionOpenChange,
  deleteTaskId,
  onDeleteOpenChange,
  onCloseDialogs,
  onCancelDelete,
  onSubmitCreate,
  onSubmitEdit,
  onConfirmDelete,
  submitting,
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
  labels,
}: TaskDialogsProps) {
  return (
    <>
      <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{labels.createIssue}</DialogTitle>
            <DialogDescription>{labels.createIssueDesc}</DialogDescription>
          </DialogHeader>
          <TaskForm
            form={form}
            setForm={setForm}
            formError={formError}
            members={members}
            membersLoading={membersLoading}
            epics={epics}
            epicsLoading={epicsLoading}
            sprints={sprints}
            sprintsLoading={sprintsLoading}
            sprintPickerLabels={sprintPickerLabels}
          />
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDialogs}>
              {labels.cancel}
            </Button>
            <Button onClick={onSubmitCreate} disabled={submitting}>
              {labels.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingTask)} onOpenChange={onEditOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {editingTask?.key ? (
                <span className="font-mono text-sm font-normal text-muted-foreground">
                  {editingTask.key}
                </span>
              ) : null}
              <span>{labels.editIssue}</span>
            </DialogTitle>
            <DialogDescription>
              {editingTask ? editingTask.title : labels.editIssueDesc}
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            form={form}
            setForm={setForm}
            formError={formError}
            members={members}
            membersLoading={membersLoading}
            epics={epics}
            epicsLoading={epicsLoading}
            sprints={sprints}
            sprintsLoading={sprintsLoading}
            sprintPickerLabels={sprintPickerLabels}
          />
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDialogs}>
              {labels.cancel}
            </Button>
            <Button onClick={onSubmitEdit} disabled={submitting}>
              {labels.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewDescriptionTask)} onOpenChange={onViewDescriptionOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {viewDescriptionTask?.key ? (
                <span className="font-mono text-sm font-normal text-muted-foreground">
                  {viewDescriptionTask.key}
                </span>
              ) : null}
              <span>{viewDescriptionTask?.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {viewDescriptionTask?.description ? (
              <MarkdownContent content={viewDescriptionTask.description} className="text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{labels.noDescription}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTaskId)} onOpenChange={onDeleteOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.deleteIssue}</DialogTitle>
            <DialogDescription>{labels.deleteIssueDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onCancelDelete}>
              {labels.cancel}
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete}>
              {labels.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
