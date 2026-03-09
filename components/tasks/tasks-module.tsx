"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ArrowLeftIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { ISSUE_PRIORITIES, ISSUE_PRIORITY_LABELS, ISSUE_STATES, ISSUE_STATE_LABELS } from "@/lib/issues";
import { useIssues, type IssueFilters } from "@/lib/hooks/use-issues";
import { useProjectMembers } from "@/lib/hooks/use-project-members";
import type { Issue, IssuePriority, IssueState } from "@/lib/types";

type TasksModuleProps = {
  projectId: string;
  projectName: string;
};

type ViewMode = "list" | "kanban";

type IssueFormState = {
  title: string;
  description: string;
  state: IssueState;
  priority: IssuePriority;
  assigneeId: string;
  dueDate: string;
};

const defaultIssueForm: IssueFormState = {
  title: "",
  description: "",
  state: "BACKLOG",
  priority: "NONE",
  assigneeId: "",
  dueDate: "",
};

const priorityRank: Record<IssuePriority, number> = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function toFormState(issue: Issue): IssueFormState {
  return {
    title: issue.title,
    description: issue.description ?? "",
    state: issue.state,
    priority: issue.priority,
    assigneeId: issue.assigneeId ?? "",
    dueDate: issue.dueDate ? issue.dueDate.slice(0, 10) : "",
  };
}

export function TasksModule({ projectId, projectName }: TasksModuleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortMode, setSortMode] = useState<"created_desc" | "due_asc" | "priority_desc">("created_desc");

  const [filters, setFilters] = useState<IssueFilters>({
    state: "ALL",
    priority: "ALL",
    assigneeId: "ALL",
    dueFrom: "",
    dueTo: "",
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<Issue | null>(null);
  const [deleteIssueId, setDeleteIssueId] = useState<string | null>(null);
  const [form, setForm] = useState<IssueFormState>(defaultIssueForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragIssueId, setDragIssueId] = useState<string | null>(null);

  const { issues, loading, error, createIssue, updateIssue, deleteIssue } = useIssues(projectId, filters);
  const { members, loading: membersLoading } = useProjectMembers(projectId);

  useEffect(() => {
    const key = `tasks:view:${projectId}`;
    const stored = window.localStorage.getItem(key);
    if (stored === "list" || stored === "kanban") {
      setViewMode(stored);
    }
  }, [projectId]);

  const setAndStoreViewMode = (value: ViewMode) => {
    setViewMode(value);
    window.localStorage.setItem(`tasks:view:${projectId}`, value);
  };

  const sortedIssues = useMemo(() => {
    const items = [...issues];
    if (sortMode === "due_asc") {
      items.sort((a, b) => {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
      return items;
    }

    if (sortMode === "priority_desc") {
      items.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
      return items;
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  }, [issues, sortMode]);

  const openCreateDialog = () => {
    setForm(defaultIssueForm);
    setFormError(null);
    setCreateOpen(true);
  };

  const openEditDialog = (issue: Issue) => {
    setEditIssue(issue);
    setForm(toFormState(issue));
    setFormError(null);
  };

  const closeDialogs = () => {
    setCreateOpen(false);
    setEditIssue(null);
    setForm(defaultIssueForm);
    setFormError(null);
  };

  const submitCreate = async () => {
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }

    try {
      setSubmitting(true);
      await createIssue({
        title: form.title,
        description: form.description || null,
        state: form.state,
        priority: form.priority,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      });
      closeDialogs();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Failed to create issue");
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!editIssue) {
      return;
    }

    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }

    try {
      setSubmitting(true);
      await updateIssue(editIssue.id, {
        title: form.title,
        description: form.description || null,
        state: form.state,
        priority: form.priority,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      });
      closeDialogs();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Failed to update issue");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteIssueId) {
      return;
    }

    try {
      await deleteIssue(deleteIssueId);
      setDeleteIssueId(null);
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Failed to delete issue");
    }
  };

  const onDropToState = async (state: IssueState) => {
    if (!dragIssueId) {
      return;
    }

    const draggedIssue = issues.find((issue) => issue.id === dragIssueId);
    if (!draggedIssue || draggedIssue.state === state) {
      setDragIssueId(null);
      return;
    }

    try {
      await updateIssue(draggedIssue.id, { state });
    } finally {
      setDragIssueId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="gap-2 px-2">
                <Link href={`/?projectId=${projectId}`}>
                  <ArrowLeftIcon className="size-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold">Tasks</h1>
            <p className="text-sm text-muted-foreground">Project: {projectName}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border bg-card p-1">
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setAndStoreViewMode("list")}
              >
                List
              </Button>
              <Button
                size="sm"
                variant={viewMode === "kanban" ? "default" : "ghost"}
                onClick={() => setAndStoreViewMode("kanban")}
              >
                Kanban
              </Button>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="gap-2">
                  <PlusIcon className="size-4" />
                  New Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Issue</DialogTitle>
                  <DialogDescription>Add a new task to the project.</DialogDescription>
                </DialogHeader>
                <IssueForm
                  form={form}
                  setForm={setForm}
                  formError={formError}
                  members={members}
                  membersLoading={membersLoading}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialogs}>
                    Cancel
                  </Button>
                  <Button onClick={submitCreate} disabled={submitting}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-4 p-4">
          <div className="grid gap-3 md:grid-cols-6">
            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={filters.state ?? "ALL"}
              onChange={(event) => setFilters((prev) => ({ ...prev, state: event.target.value as IssueState | "ALL" }))}
            >
              <option value="ALL">All states</option>
              {ISSUE_STATES.map((state) => (
                <option key={state} value={state}>
                  {ISSUE_STATE_LABELS[state]}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={filters.priority ?? "ALL"}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, priority: event.target.value as IssuePriority | "ALL" }))
              }
            >
              <option value="ALL">All priorities</option>
              {ISSUE_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {ISSUE_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={filters.assigneeId ?? "ALL"}
              onChange={(event) => setFilters((prev) => ({ ...prev, assigneeId: event.target.value || "ALL" }))}
            >
              <option value="ALL">All assignees</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>

            <DatePicker
              value={filters.dueFrom ?? ""}
              onChange={(value) => setFilters((prev) => ({ ...prev, dueFrom: value }))}
              placeholder="Due from"
            />

            <DatePicker
              value={filters.dueTo ?? ""}
              onChange={(value) => setFilters((prev) => ({ ...prev, dueTo: value }))}
              placeholder="Due to"
            />

            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as "created_desc" | "due_asc" | "priority_desc")
              }
            >
              <option value="created_desc">Newest</option>
              <option value="due_asc">Due Date</option>
              <option value="priority_desc">Priority</option>
            </select>
          </div>
        </Card>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        {loading ? <p className="text-sm text-muted-foreground">Loading issues...</p> : null}

        {!loading && viewMode === "list" ? (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">State</th>
                  <th className="px-3 py-2 font-medium">Priority</th>
                  <th className="px-3 py-2 font-medium">Assignee</th>
                  <th className="px-3 py-2 font-medium">Due Date</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedIssues.map((issue) => (
                  <tr key={issue.id} className="border-b">
                    <td className="px-3 py-2">
                      <p className="font-medium">{issue.title}</p>
                      {issue.description ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">{issue.description}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline">{ISSUE_STATE_LABELS[issue.state]}</Badge>
                    </td>
                    <td className="px-3 py-2">{ISSUE_PRIORITY_LABELS[issue.priority]}</td>
                    <td className="px-3 py-2">{issue.assignee?.name ?? "-"}</td>
                    <td className="px-3 py-2">{formatDate(issue.dueDate)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(issue)}>
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteIssueId(issue.id)}>
                          <TrashIcon className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : null}

        {!loading && viewMode === "kanban" ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {ISSUE_STATES.map((state) => {
              const columnIssues = sortedIssues.filter((issue) => issue.state === state);
              return (
                <Card
                  key={state}
                  className="min-h-[420px] p-3"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => onDropToState(state)}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">{ISSUE_STATE_LABELS[state]}</h3>
                    <Badge variant="secondary">{columnIssues.length}</Badge>
                  </div>

                  <div className="space-y-2">
                    {columnIssues.map((issue) => (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={() => setDragIssueId(issue.id)}
                        className="rounded-md border bg-card p-3"
                      >
                        <p className="mb-1 text-sm font-medium">{issue.title}</p>
                        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{ISSUE_PRIORITY_LABELS[issue.priority]}</span>
                          <span>•</span>
                          <span>{issue.assignee?.name ?? "Unassigned"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Due: {formatDate(issue.dueDate)}</span>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(issue)}>
                              <PencilIcon className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteIssueId(issue.id)}>
                              <TrashIcon className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>

      <Dialog open={Boolean(editIssue)} onOpenChange={(open) => (open ? null : closeDialogs())}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Issue</DialogTitle>
            <DialogDescription>Update task data.</DialogDescription>
          </DialogHeader>
          <IssueForm
            form={form}
            setForm={setForm}
            formError={formError}
            members={members}
            membersLoading={membersLoading}
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={submitting}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteIssueId)} onOpenChange={(open) => (open ? null : setDeleteIssueId(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete issue</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIssueId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type IssueFormProps = {
  form: IssueFormState;
  setForm: Dispatch<SetStateAction<IssueFormState>>;
  formError: string | null;
  members: Array<{ id: string; name: string }>;
  membersLoading: boolean;
};

function IssueForm({ form, setForm, formError, members, membersLoading }: IssueFormProps) {
  return (
    <div className="space-y-3">
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <Input
        placeholder="Issue title"
        value={form.title}
        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
      />

      <textarea
        className="min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        placeholder="Description"
        value={form.description}
        onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="h-9 rounded-md border bg-transparent px-2 text-sm"
          value={form.state}
          onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value as IssueState }))}
        >
          {ISSUE_STATES.map((state) => (
            <option key={state} value={state}>
              {ISSUE_STATE_LABELS[state]}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-md border bg-transparent px-2 text-sm"
          value={form.priority}
          onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as IssuePriority }))}
        >
          {ISSUE_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {ISSUE_PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-md border bg-transparent px-2 text-sm"
          value={form.assigneeId}
          onChange={(event) => setForm((prev) => ({ ...prev, assigneeId: event.target.value }))}
          disabled={membersLoading}
        >
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        <DatePicker
          value={form.dueDate}
          onChange={(value) => setForm((prev) => ({ ...prev, dueDate: value }))}
          placeholder="Due date"
        />
      </div>
    </div>
  );
}
