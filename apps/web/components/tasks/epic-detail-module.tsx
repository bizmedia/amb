"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DescriptionEditor } from "@/components/ui/description-editor";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { fetchApiData } from "@/lib/api/http";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";
import { EPIC_STATUSES } from "@amb-app/shared";
import type { Epic, EpicStatus, TaskPriority, TaskState, TaskSprint } from "@amb-app/shared";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATE_LABELS,
} from "@/lib/tasks";
import { SprintBadge } from "@/components/tasks/sprint-badge";
import {
  TasksDetailTitleRow,
  TasksNestedTableSection,
  TasksWorkspaceFilterDeck,
  tasksDetailBackButtonClass,
} from "@/components/tasks/tasks-workspace-shell";

type EpicDetailPayload = Epic & {
  _count: { tasks: number };
  tasks: Array<{
    id: string;
    key: string | null;
    title: string;
    state: TaskState;
    priority: TaskPriority;
    assignee: { id: string; name: string; role: string } | null;
    sprint: TaskSprint | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

type EpicDetailModuleProps = {
  projectId: string;
  epicId: string;
};

export function EpicDetailModule({ projectId, epicId }: EpicDetailModuleProps) {
  const t = useTranslations("Epics");
  const tTasks = useTranslations("Tasks");
  const tSprints = useTranslations("Sprints");
  const tCommon = useTranslations("Common");
  const [epic, setEpic] = useState<EpicDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<EpicStatus>("OPEN");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApiData<EpicDetailPayload>(
        `/api/projects/${projectId}/epics/${epicId}`,
      );
      setEpic(data);
      setError(null);
    } catch (e) {
      setError(getLocalizedApiErrorMessage(e, tCommon));
      setEpic(null);
    } finally {
      setLoading(false);
    }
  }, [epicId, projectId, tCommon]);

  useEffect(() => {
    void load();
  }, [load]);

  const openEdit = () => {
    if (!epic) return;
    setFormTitle(epic.title);
    setFormDescription(epic.description ?? "");
    setFormStatus(epic.status);
    setFormError(null);
    setEditing(true);
  };

  const submitEdit = async () => {
    if (!epic || !formTitle.trim()) {
      setFormError(t("titleRequired"));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const updated = await fetchApiData<Epic>(`/api/projects/${projectId}/epics/${epic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
        }),
      });
      setEpic((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              _count: prev._count,
              tasks: prev.tasks,
            }
          : null,
      );
      setEditing(false);
      await load();
    } catch (e) {
      setFormError(getLocalizedApiErrorMessage(e, tCommon));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmArchive = async () => {
    if (!epic) return;
    try {
      await fetchApiData(`/api/projects/${projectId}/epics/${epic.id}`, {
        method: "DELETE",
      });
      setArchiveOpen(false);
      await load();
    } catch (e) {
      setFormError(getLocalizedApiErrorMessage(e, tCommon));
    }
  };

  if (loading && !epic) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (error && !epic) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!epic) {
    return null;
  }

  return (
    <div className="space-y-3">
      <TasksWorkspaceFilterDeck>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <Button asChild variant="ghost" size="sm" className={tasksDetailBackButtonClass}>
              <Link href="/tasks/epics">
                <ArrowLeftIcon className="size-4" />
                {t("backToEpics")}
              </Link>
            </Button>
            <TasksDetailTitleRow
              title={epic.title}
              badge={<Badge variant="outline">{t(`status.${epic.status}`)}</Badge>}
              meta={t("tasksCount", { count: epic._count.tasks })}
              link={
                <Button asChild variant="link" className="h-auto p-0 text-sm">
                  <Link href={`/tasks?epicId=${epic.id}`}>{t("viewInIssues")}</Link>
                </Button>
              }
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={openEdit}>
              <PencilIcon className="size-4" />
              {tCommon("edit")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive"
              onClick={() => setArchiveOpen(true)}
              disabled={epic.status === "ARCHIVED"}
            >
              <TrashIcon className="size-4" />
              {t("archive")}
            </Button>
          </div>
        </div>
      </TasksWorkspaceFilterDeck>

      {epic.description ? (
        <div className="tasks-filter-deck p-4">
          <MarkdownContent content={epic.description} className="text-sm" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("noDescription")}</p>
      )}

      <TasksNestedTableSection title={t("tasksInEpic")}>
        {epic.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noTasksInEpic")}</p>
        ) : (
          <div className="tasks-data-table-wrap overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="tasks-table-head">
                <tr className="text-left">
                  <th className="px-3">{tTasks("taskKey")}</th>
                  <th className="px-3">{tTasks("columnIssue")}</th>
                  <th className="px-3">{tTasks("sprint")}</th>
                  <th className="px-3">{tTasks("state")}</th>
                  <th className="px-3">{tTasks("priority")}</th>
                </tr>
              </thead>
              <tbody>
                {epic.tasks.map((task, rowIndex) => (
                  <tr
                    key={task.id}
                    className="tasks-table-row"
                    style={{ "--stagger": Math.min(rowIndex * 22, 440) } as CSSProperties}
                  >
                    <td className="whitespace-nowrap px-3 py-2 align-top">
                      {task.key ? (
                        <Link
                          href={`/tasks?key=${encodeURIComponent(task.key)}`}
                          className="font-mono text-[11px] tabular-nums tracking-tight text-primary/85 underline-offset-4 hover:underline"
                        >
                          {task.key}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="max-w-[min(420px,40vw)] px-3 py-2 align-top">
                      <p className="text-sm font-medium leading-snug tracking-tight">{task.title}</p>
                    </td>
                    <td className="px-3 py-2 align-top">
                      {task.sprint ? (
                        <SprintBadge
                          sprint={task.sprint}
                          statusLabel={tSprints(`status.${task.sprint.status}`)}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Badge variant="outline" className="font-normal">
                        {TASK_STATE_LABELS[task.state]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 align-top">
                      {task.priority === "NONE" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Badge variant="outline" className="font-normal">
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TasksNestedTableSection>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("editEpic")}</DialogTitle>
            <DialogDescription>{t("editEpicDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={t("epicTitlePlaceholder")}
            />
            <DescriptionEditor
              value={formDescription}
              onChange={setFormDescription}
              minHeight="8rem"
            />
            <select
              className="h-9 w-full rounded-md border bg-transparent px-2 text-sm"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as EpicStatus)}
            >
              {EPIC_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={() => void submitEdit()} disabled={submitting}>
              {tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("archiveEpic")}</DialogTitle>
            <DialogDescription>{t("archiveEpicDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={() => void confirmArchive()}>
              {t("archive")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
