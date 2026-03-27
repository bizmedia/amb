"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeftIcon,
  IterationCcwIcon,
  PencilIcon,
  PlayIcon,
  CheckCircleIcon,
  TrashIcon,
} from "lucide-react";

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
import { DatePicker } from "@/components/ui/date-picker";
import { DescriptionEditor } from "@/components/ui/description-editor";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { fetchApiData } from "@/lib/api/http";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";
import { EpicBadge } from "@/components/tasks/epic-badge";
import {
  TasksDetailTitleRow,
  TasksNestedTableSection,
  TasksWorkspaceFilterDeck,
  tasksDetailBackButtonClass,
} from "@/components/tasks/tasks-workspace-shell";
import type { Sprint, TaskEpic, TaskPriority, TaskState } from "@amb-app/shared";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATE_LABELS,
} from "@/lib/tasks";

type SprintDetailTask = {
  id: string;
  key: string | null;
  title: string;
  state: TaskState;
  priority: TaskPriority;
  assignee: { id: string; name: string; role: string } | null;
  epic: TaskEpic | null;
  createdAt: string;
  updatedAt: string;
};

type SprintDetailPayload = Sprint & {
  _count: { tasks: number };
  tasks: SprintDetailTask[];
};

type SprintDetailModuleProps = {
  projectId: string;
  sprintId: string;
};

function formatSprintRange(start: string | null, end: string | null, empty: string) {
  if (!start && !end) return empty;
  const fmt = (v: string) => new Date(v).toLocaleDateString();
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return start ? fmt(start) : fmt(end!);
}

export function SprintDetailModule({ projectId, sprintId }: SprintDetailModuleProps) {
  const router = useRouter();
  const t = useTranslations("Sprints");
  const tTasks = useTranslations("Tasks");
  const tEpic = useTranslations("Epics");
  const tCommon = useTranslations("Common");
  const [sprint, setSprint] = useState<SprintDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [startConfirm, setStartConfirm] = useState(false);
  const [completeConfirm, setCompleteConfirm] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formGoal, setFormGoal] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApiData<SprintDetailPayload>(
        `/api/projects/${projectId}/sprints/${sprintId}`,
      );
      setSprint(data);
      setError(null);
    } catch (e) {
      setError(getLocalizedApiErrorMessage(e, tCommon));
      setSprint(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId, tCommon]);

  useEffect(() => {
    void load();
  }, [load]);

  const toIsoOrNull = (dateStr: string) => {
    if (!dateStr.trim()) return null;
    const d = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const openEdit = () => {
    if (!sprint) return;
    setFormName(sprint.name);
    setFormGoal(sprint.goal ?? "");
    setFormStart(sprint.startDate ? sprint.startDate.slice(0, 10) : "");
    setFormEnd(sprint.endDate ? sprint.endDate.slice(0, 10) : "");
    setFormError(null);
    setEditing(true);
  };

  const submitEdit = async () => {
    if (!sprint || !formName.trim()) {
      setFormError(t("nameRequired"));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const updated = await fetchApiData<Sprint>(`/api/projects/${projectId}/sprints/${sprint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          goal: formGoal.trim() || null,
          startDate: toIsoOrNull(formStart),
          endDate: toIsoOrNull(formEnd),
        }),
      });
      setSprint((prev) =>
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

  const runStart = async () => {
    if (!sprint) return;
    setSubmitting(true);
    try {
      await fetchApiData(`/api/projects/${projectId}/sprints/${sprint.id}/start`, {
        method: "POST",
      });
      setStartConfirm(false);
      await load();
    } catch (e) {
      setFormError(getLocalizedApiErrorMessage(e, tCommon));
    } finally {
      setSubmitting(false);
    }
  };

  const runComplete = async () => {
    if (!sprint) return;
    setSubmitting(true);
    try {
      await fetchApiData(`/api/projects/${projectId}/sprints/${sprint.id}/complete`, {
        method: "POST",
      });
      setCompleteConfirm(false);
      await load();
    } catch (e) {
      setFormError(getLocalizedApiErrorMessage(e, tCommon));
    } finally {
      setSubmitting(false);
    }
  };

  const runDelete = async () => {
    if (!sprint) return;
    setSubmitting(true);
    try {
      await fetchApiData(`/api/projects/${projectId}/sprints/${sprint.id}`, {
        method: "DELETE",
      });
      setDeleteOpen(false);
      router.push("/tasks/sprints");
    } catch (e) {
      setFormError(getLocalizedApiErrorMessage(e, tCommon));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !sprint) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (error && !sprint) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!sprint) {
    return null;
  }

  return (
    <div className="space-y-3">
      <TasksWorkspaceFilterDeck>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <Button asChild variant="ghost" size="sm" className={tasksDetailBackButtonClass}>
              <Link href="/tasks/sprints">
                <ArrowLeftIcon className="size-4" />
                {t("backToSprints")}
              </Link>
            </Button>
            <TasksDetailTitleRow
              title={
                <span className="flex items-center gap-2">
                  <IterationCcwIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  {sprint.name}
                </span>
              }
              badge={
                <Badge variant={sprint.status === "ACTIVE" ? "default" : "outline"}>
                  {t(`status.${sprint.status}`)}
                </Badge>
              }
              meta={`${formatSprintRange(sprint.startDate, sprint.endDate, t("noDates"))} · ${t("tasksCount", { count: sprint._count.tasks })}`}
              link={
                <Button asChild variant="link" className="h-auto p-0 text-sm">
                  <Link href={`/tasks?sprintId=${sprint.id}`}>{t("viewInIssues")}</Link>
                </Button>
              }
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={openEdit}>
              <PencilIcon className="size-4" />
              {tCommon("edit")}
            </Button>
            {sprint.status === "PLANNED" ? (
              <>
                <Button variant="default" size="sm" className="gap-2" onClick={() => setStartConfirm(true)}>
                  <PlayIcon className="size-4" />
                  {t("startSprint")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <TrashIcon className="size-4" />
                  {tCommon("delete")}
                </Button>
              </>
            ) : null}
            {sprint.status === "ACTIVE" ? (
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => setCompleteConfirm(true)}>
                <CheckCircleIcon className="size-4" />
                {t("completeSprint")}
              </Button>
            ) : null}
          </div>
        </div>
      </TasksWorkspaceFilterDeck>

      {formError && !editing ? <p className="text-sm text-destructive">{formError}</p> : null}

      {sprint.goal ? (
        <div className="tasks-filter-deck p-4">
          <MarkdownContent content={sprint.goal} className="text-sm" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("noGoal")}</p>
      )}

      <TasksNestedTableSection title={t("tasksInSprint")}>
        {sprint.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noTasksInSprint")}</p>
        ) : (
          <div className="tasks-data-table-wrap overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="tasks-table-head">
                <tr className="text-left">
                  <th className="px-3">{tTasks("taskKey")}</th>
                  <th className="px-3">{tTasks("columnIssue")}</th>
                  <th className="px-3">{tTasks("epic")}</th>
                  <th className="px-3">{tTasks("state")}</th>
                  <th className="px-3">{tTasks("priority")}</th>
                </tr>
              </thead>
              <tbody>
                {sprint.tasks.map((task, rowIndex) => (
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
                      {task.epic ? (
                        <EpicBadge epic={task.epic} statusLabel={tEpic(`status.${task.epic.status}`)} />
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
            <DialogTitle>{t("editSprint")}</DialogTitle>
            <DialogDescription>{t("editSprintDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t("namePlaceholder")}
            />
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{t("goal")}</p>
              <DescriptionEditor value={formGoal} onChange={setFormGoal} minHeight="6rem" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DatePicker value={formStart} onChange={setFormStart} placeholder={t("startDate")} />
              <DatePicker value={formEnd} onChange={setFormEnd} placeholder={t("endDate")} />
            </div>
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

      <Dialog open={startConfirm} onOpenChange={setStartConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("startSprintTitle")}</DialogTitle>
            <DialogDescription>{t("startSprintDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartConfirm(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={() => void runStart()} disabled={submitting}>
              {t("startSprint")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={completeConfirm} onOpenChange={setCompleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("completeSprintTitle")}</DialogTitle>
            <DialogDescription>{t("completeSprintDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteConfirm(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={() => void runComplete()} disabled={submitting}>
              {t("completeSprint")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteSprintTitle")}</DialogTitle>
            <DialogDescription>{t("deleteSprintDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={() => void runDelete()} disabled={submitting}>
              {tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
