"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ArrowLeftIcon, FileTextIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

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
import { MarkdownContent } from "@/components/ui/markdown-content";
import { DescriptionEditor } from "@/components/ui/description-editor";
import { ISSUE_PRIORITIES, ISSUE_PRIORITY_LABELS, ISSUE_STATES, ISSUE_STATE_LABELS } from "@/lib/issues";
import { useIssues, type IssueFilters } from "@/lib/hooks/use-issues";
import { useProjectMembers } from "@/lib/hooks/use-project-members";
import type { Issue, IssuePriority, IssueState } from "@/lib/types";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";

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
  const t = useTranslations("Tasks");
  const tCommon = useTranslations("Common");
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
  const [viewDescriptionIssue, setViewDescriptionIssue] = useState<Issue | null>(null);
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
      setFormError(t("titleRequired"));
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
      setFormError(getLocalizedApiErrorMessage(submitError, tCommon));
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!editIssue) {
      return;
    }

    if (!form.title.trim()) {
      setFormError(t("titleRequired"));
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
      setFormError(getLocalizedApiErrorMessage(submitError, tCommon));
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
      setFormError(getLocalizedApiErrorMessage(deleteError, tCommon));
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
      <div className="mx-auto max-w-screen-2xl px-4 py-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="gap-2 px-2">
                <Link href="/">
                  <ArrowLeftIcon className="size-4" />
                  {t("backToDashboard")}
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold">{t("tasksTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("projectLabel")}: {projectName}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border bg-card p-1">
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setAndStoreViewMode("list")}
              >
                {t("list")}
              </Button>
              <Button
                size="sm"
                variant={viewMode === "kanban" ? "default" : "ghost"}
                onClick={() => setAndStoreViewMode("kanban")}
              >
                {t("kanban")}
              </Button>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="gap-2">
                  <PlusIcon className="size-4" />
                  {t("newIssue")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("createIssue")}</DialogTitle>
                  <DialogDescription>{t("createIssueDesc")}</DialogDescription>
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
                    {tCommon("cancel")}
                  </Button>
                  <Button onClick={submitCreate} disabled={submitting}>
                    {tCommon("create")}
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
              <option value="ALL">{t("allStates")}</option>
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
              <option value="ALL">{t("allPriorities")}</option>
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
              <option value="ALL">{t("allAssignees")}</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>

            <DatePicker
              value={filters.dueFrom ?? ""}
              onChange={(value) => setFilters((prev) => ({ ...prev, dueFrom: value }))}
              placeholder={t("dueFrom")}
            />

            <DatePicker
              value={filters.dueTo ?? ""}
              onChange={(value) => setFilters((prev) => ({ ...prev, dueTo: value }))}
              placeholder={t("dueTo")}
            />

            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as "created_desc" | "due_asc" | "priority_desc")
              }
            >
              <option value="created_desc">{t("newest")}</option>
              <option value="due_asc">{t("dueDate")}</option>
              <option value="priority_desc">{t("priority")}</option>
            </select>
          </div>
        </Card>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        {loading ? <p className="text-sm text-muted-foreground">{t("loadingIssues")}</p> : null}

        {!loading && viewMode === "list" ? (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">{t("title")}</th>
                  <th className="px-3 py-2 font-medium">{t("state")}</th>
                  <th className="px-3 py-2 font-medium">{t("priority")}</th>
                  <th className="px-3 py-2 font-medium">{t("assignee")}</th>
                  <th className="px-3 py-2 font-medium">{t("dueDateCol")}</th>
                  <th className="px-3 py-2 font-medium">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedIssues.map((issue) => (
                  <tr key={issue.id} className="border-b">
                    <td className="px-3 py-2">
                      <p className="font-medium">{issue.title}</p>
                      {issue.description ? (
                        <div className="mt-1 flex items-start gap-1">
                          <div className="min-w-0 flex-1">
                            <MarkdownContent content={issue.description} className="text-xs text-muted-foreground" clamped />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0"
                            onClick={() => setViewDescriptionIssue(issue)}
                            title={t("openDescription")}
                          >
                            <FileTextIcon className="size-3.5" />
                          </Button>
                        </div>
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
          <div className="grid w-full grid-cols-4 gap-3">
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
                        {issue.description ? (
                          <div className="mb-2">
                            <MarkdownContent content={issue.description} className="text-xs text-muted-foreground" clamped />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewDescriptionIssue(issue);
                              }}
                            >
                              <FileTextIcon className="mr-1 size-3" />
                              {t("more")}
                            </Button>
                          </div>
                        ) : null}
                        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{ISSUE_PRIORITY_LABELS[issue.priority]}</span>
                          <span>•</span>
                          <span>{issue.assignee?.name ?? t("unassigned")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t("due")}: {formatDate(issue.dueDate)}</span>
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
            <DialogTitle>{t("editIssue")}</DialogTitle>
            <DialogDescription>{t("editIssueDesc")}</DialogDescription>
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
              {tCommon("cancel")}
            </Button>
            <Button onClick={submitEdit} disabled={submitting}>
              {tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewDescriptionIssue)} onOpenChange={(open) => (open ? null : setViewDescriptionIssue(null))}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewDescriptionIssue?.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {viewDescriptionIssue?.description ? (
              <MarkdownContent content={viewDescriptionIssue.description} className="text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{t("noDescription")}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteIssueId)} onOpenChange={(open) => (open ? null : setDeleteIssueId(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteIssue")}</DialogTitle>
            <DialogDescription>{t("deleteIssueDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIssueId(null)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {tCommon("delete")}
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
  const t = useTranslations("Tasks");
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
          <option value="">{t("unassigned")}</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        <DatePicker
          value={form.dueDate}
          onChange={(value) => setForm((prev) => ({ ...prev, dueDate: value }))}
          placeholder={t("dueDatePlaceholder")}
        />
      </div>
    </div>
  );
}
