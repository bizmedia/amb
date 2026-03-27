"use client";

import { useState, type CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

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
import { useEpics } from "@/lib/hooks/use-epics";
import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";
import { EPIC_STATUSES } from "@amb-app/shared";
import type { Epic, EpicStatus } from "@amb-app/shared";
import {
  TasksWorkspaceEmpty,
  TasksWorkspaceFilterDeck,
  TasksWorkspaceToolRow,
  tasksFilterSelectClass,
  tasksWorkspacePrimaryButtonClass,
} from "@/components/tasks/tasks-workspace-shell";
import { cn } from "@/lib/utils";

type EpicsListModuleProps = {
  projectId: string;
};

export function EpicsListModule({ projectId }: EpicsListModuleProps) {
  const t = useTranslations("Epics");
  const tCommon = useTranslations("Common");
  const [statusFilter, setStatusFilter] = useState<EpicStatus | "ALL">("ALL");
  const { epics, loading, error, createEpic, updateEpic, archiveEpic } = useEpics(
    projectId,
    statusFilter,
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Epic | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<EpicStatus>("OPEN");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setFormTitle("");
    setFormDescription("");
    setFormStatus("OPEN");
    setFormError(null);
    setCreateOpen(true);
  };

  const openEdit = (epic: Epic) => {
    setEditing(epic);
    setFormTitle(epic.title);
    setFormDescription(epic.description ?? "");
    setFormStatus(epic.status);
    setFormError(null);
  };

  const submitCreate = async () => {
    if (!formTitle.trim()) {
      setFormError(t("titleRequired"));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createEpic({
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        status: formStatus,
      });
      setCreateOpen(false);
    } catch (e) {
      setFormError(getLocalizedApiErrorMessage(e, tCommon));
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!editing || !formTitle.trim()) {
      setFormError(t("titleRequired"));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await updateEpic(editing.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        status: formStatus,
      });
      setEditing(null);
    } catch (e) {
      setFormError(getLocalizedApiErrorMessage(e, tCommon));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmArchive = async () => {
    if (!archiveId) return;
    try {
      await archiveEpic(archiveId);
      setArchiveId(null);
    } catch (e) {
      setFormError(getLocalizedApiErrorMessage(e, tCommon));
    }
  };

  return (
    <div className="space-y-3">
      <TasksWorkspaceToolRow
        deck={
          <TasksWorkspaceFilterDeck>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-2">
              <span className="tasks-kicker">{t("listTitle")}</span>
              <select
                className={cn(tasksFilterSelectClass, "max-w-none sm:max-w-[14rem]")}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EpicStatus | "ALL")}
                aria-label={t("filterStatus")}
              >
                <option value="ALL">{t("statusAll")}</option>
                {EPIC_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}`)}
                  </option>
                ))}
              </select>
            </div>
          </TasksWorkspaceFilterDeck>
        }
        actions={
          <Button className={cn("gap-2", tasksWorkspacePrimaryButtonClass)} onClick={openCreate}>
            <PlusIcon className="size-4" />
            {t("newEpic")}
          </Button>
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {formError && !createOpen && !editing ? (
        <p className="text-sm text-destructive">{formError}</p>
      ) : null}

      {loading ? <p className="text-sm text-muted-foreground">{t("loading")}</p> : null}

      {!loading && epics.length === 0 ? <TasksWorkspaceEmpty>{t("empty")}</TasksWorkspaceEmpty> : null}

      {!loading && epics.length > 0 ? (
        <div className="tasks-data-table-wrap overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="tasks-table-head">
              <tr className="text-left">
                <th className="px-3">{t("columnTitle")}</th>
                <th className="px-3">{t("columnStatus")}</th>
                <th className="px-3">{t("columnTasks")}</th>
                <th className="px-3">{t("columnActions")}</th>
              </tr>
            </thead>
            <tbody>
              {epics.map((epic, rowIndex) => (
                <tr
                  key={epic.id}
                  className="tasks-table-row"
                  style={{ "--stagger": Math.min(rowIndex * 22, 440) } as CSSProperties}
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/tasks/epics/${epic.id}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {epic.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{t(`status.${epic.status}`)}</Badge>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{epic._count?.tasks ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(epic)}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setArchiveId(epic.id)}
                        disabled={epic.status === "ARCHIVED"}
                        title={t("archive")}
                      >
                        <TrashIcon className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("createEpic")}</DialogTitle>
            <DialogDescription>{t("createEpicDesc")}</DialogDescription>
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
              {EPIC_STATUSES.filter((s) => s !== "ARCHIVED").map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={() => void submitCreate()} disabled={submitting}>
              {tCommon("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
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
            <Button variant="outline" onClick={() => setEditing(null)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={() => void submitEdit()} disabled={submitting}>
              {tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(archiveId)} onOpenChange={(o) => !o && setArchiveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("archiveEpic")}</DialogTitle>
            <DialogDescription>{t("archiveEpicDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveId(null)}>
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
