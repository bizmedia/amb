"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { getLocalizedApiErrorMessage } from "@/lib/api/error-i18n";
import { useEpics } from "@/lib/hooks/use-epics";
import { useProjectMembers } from "@/lib/hooks/use-project-members";
import { useSprints } from "@/lib/hooks/use-sprints";
import { useTasks, type TaskFilters } from "@/lib/hooks/use-tasks";
import { taskSearchToApiQuery } from "@/lib/tasks";
import type { Task, TaskState } from "@/lib/types";
import { TaskDetailsSheet } from "./tasks-module/components/TaskDetailsSheet";
import { TaskDialogs } from "./tasks-module/components/TaskDialogs";
import { TasksFilters } from "./tasks-module/components/TasksFilters";
import { TasksKanbanBoard } from "./tasks-module/components/TasksKanbanBoard";
import { TasksListTable } from "./tasks-module/components/TasksListTable";
import { TasksToolbar } from "./tasks-module/components/TasksToolbar";
import { defaultTaskForm, type TaskListSort, type ViewMode } from "./tasks-module/types";
import { toTaskFormState } from "./tasks-module/utils/task-form-state";
import {
  compareTasksBySort,
  defaultSortDirection,
  defaultTaskListSort,
} from "./tasks-module/utils/task-list-sort";

type TasksModuleProps = {
  projectId: string;
};

export function TasksModule({ projectId }: TasksModuleProps) {
  const t = useTranslations("Tasks");
  const tEpic = useTranslations("Epics");
  const tSprints = useTranslations("Sprints");
  const tCommon = useTranslations("Common");
  const searchParams = useSearchParams();
  const urlKey = searchParams.get("key");
  const urlSearchParam = searchParams.get("search");
  const urlEpicId = searchParams.get("epicId");
  const urlSprintId = searchParams.get("sprintId");

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [listSort, setListSort] = useState<TaskListSort>(defaultTaskListSort);
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("key") ?? searchParams.get("search") ?? "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("key") ?? searchParams.get("search") ?? "",
  );
  const [filters, setFilters] = useState<TaskFilters>({
    state: "ALL",
    priority: "ALL",
    assigneeId: "ALL",
    epicId: "ALL",
    sprintId: "ALL",
    dueFrom: "",
    dueTo: "",
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [viewDescriptionTask, setViewDescriptionTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultTaskForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [copiedTaskKeyId, setCopiedTaskKeyId] = useState<string | null>(null);
  const kanbanColRefs = useRef<Partial<Record<TaskState, HTMLDivElement | null>>>({});
  const [kanbanMobileColumn, setKanbanMobileColumn] = useState<TaskState>("BACKLOG");

  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks(projectId, filters);
  const { members, loading: membersLoading } = useProjectMembers(projectId);
  const { epics: activeEpics, loading: epicsLoading } = useEpics(projectId, "ALL");
  const { sprints: allSprints, loading: sprintsLoading } = useSprints(projectId, "ALL");

  useEffect(() => {
    const fromUrl = urlKey ?? urlSearchParam ?? "";
    setSearchInput(fromUrl);
    setDebouncedSearch(fromUrl);
  }, [projectId, urlKey, urlSearchParam]);

  useEffect(() => {
    if (!urlEpicId) {
      return;
    }
    setFilters((prev) => ({ ...prev, epicId: urlEpicId }));
  }, [projectId, urlEpicId]);

  useEffect(() => {
    if (!urlSprintId) {
      return;
    }
    setFilters((prev) => ({ ...prev, sprintId: urlSprintId }));
  }, [projectId, urlSprintId]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const q = taskSearchToApiQuery(debouncedSearch);
    setFilters((prev) => {
      const next: TaskFilters = { ...prev };
      delete next.key;
      delete next.search;
      if (q.key) {
        next.key = q.key;
      } else if (q.search) {
        next.search = q.search;
      }
      return next;
    });
  }, [debouncedSearch]);

  useEffect(() => {
    const key = `tasks:view:${projectId}`;
    const stored = window.localStorage.getItem(key);
    if (stored === "list" || stored === "kanban") {
      setViewMode(stored);
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [selectedTaskId, tasks]);

  const setAndStoreViewMode = (value: ViewMode) => {
    setViewMode(value);
    window.localStorage.setItem(`tasks:view:${projectId}`, value);
  };

  const sortedTasks = useMemo(() => {
    const items = [...tasks];
    items.sort((a, b) => {
      const primary = compareTasksBySort(a, b, listSort);
      if (primary !== 0) return primary;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return items;
  }, [tasks, listSort]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );

  const toggleListSort = (column: TaskListSort["column"]) => {
    setListSort((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { column, direction: defaultSortDirection(column) },
    );
  };

  const openCreateDialog = () => {
    setForm(defaultTaskForm);
    setFormError(null);
    setCreateOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setForm(toTaskFormState(task));
    setFormError(null);
  };

  const closeDialogs = () => {
    setCreateOpen(false);
    setEditingTask(null);
    setForm(defaultTaskForm);
    setFormError(null);
  };

  const submitCreate = async () => {
    if (!form.title.trim()) {
      setFormError(t("titleRequired"));
      return;
    }

    try {
      setSubmitting(true);
      await createTask({
        title: form.title,
        description: form.description || null,
        state: form.state,
        priority: form.priority,
        assigneeId: form.assigneeId || null,
        epicId: form.epicId || null,
        sprintId: form.sprintId || null,
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
    if (!editingTask) {
      return;
    }
    if (!form.title.trim()) {
      setFormError(t("titleRequired"));
      return;
    }
    try {
      setSubmitting(true);
      await updateTask(editingTask.id, {
        title: form.title,
        description: form.description || null,
        state: form.state,
        priority: form.priority,
        assigneeId: form.assigneeId || null,
        epicId: form.epicId || null,
        sprintId: form.sprintId || null,
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
    if (!deleteTaskId) {
      return;
    }
    try {
      await deleteTask(deleteTaskId);
      setDeleteTaskId(null);
    } catch (deleteError) {
      setFormError(getLocalizedApiErrorMessage(deleteError, tCommon));
    }
  };

  const onDropToState = async (state: TaskState) => {
    if (!dragTaskId) {
      return;
    }
    const draggedTask = tasks.find((task) => task.id === dragTaskId);
    if (!draggedTask || draggedTask.state === state) {
      setDragTaskId(null);
      return;
    }
    try {
      await updateTask(draggedTask.id, { state });
    } finally {
      setDragTaskId(null);
    }
  };

  const copyTaskKey = async (task: Task) => {
    if (!task.key || !navigator.clipboard?.writeText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(task.key);
      setCopiedTaskKeyId(task.id);
      window.setTimeout(() => {
        setCopiedTaskKeyId((current) => (current === task.id ? null : current));
      }, 2000);
    } catch {
      // noop
    }
  };

  return (
    <div className="space-y-3">
      <TasksToolbar
        viewMode={viewMode}
        setAndStoreViewMode={setAndStoreViewMode}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        listLabel={t("list")}
        kanbanLabel={t("kanban")}
        searchPlaceholder={t("searchByKeyPlaceholder")}
        createLabel={t("newIssue")}
        onCreateClick={openCreateDialog}
      />

      <TasksFilters
        filters={filters}
        setFilters={setFilters}
        members={members}
        epics={activeEpics}
        sprints={allSprints}
        labels={{
          state: t("state"),
          allStates: t("allStates"),
          priority: t("priority"),
          allPriorities: t("allPriorities"),
          assignee: t("assignee"),
          allAssignees: t("allAssignees"),
          epic: t("epic"),
          allEpics: t("filterAllEpics"),
          sprint: t("sprint"),
          allSprints: t("filterAllSprints"),
          dueFrom: t("dueFrom"),
          dueTo: t("dueTo"),
          dueDateCol: t("dueDateCol"),
        }}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">{t("loadingIssues")}</p> : null}

      {!loading && viewMode === "list" ? (
        <TasksListTable
          tasks={sortedTasks}
          sort={listSort}
          onSort={toggleListSort}
          toggleSortLabel={t("toggleSort")}
          labels={{
            taskKey: t("taskKey"),
            issue: t("columnIssue"),
            state: t("state"),
            priority: t("priority"),
            epic: t("epic"),
            sprint: t("sprint"),
            assignee: t("assignee"),
            dueDate: t("dueDateCol"),
            actions: t("actions"),
            copyTaskKey: t("copyTaskKey"),
            edit: tCommon("edit"),
            delete: tCommon("delete"),
          }}
          tEpicStatus={(key) => tEpic(key)}
          tSprintStatus={(key) => tSprints(key)}
          copiedTaskKeyId={copiedTaskKeyId}
          onCopyTaskKey={copyTaskKey}
          onOpenTaskDetails={(task) => setSelectedTaskId(task.id)}
          onEditTask={openEditDialog}
          onDeleteTask={setDeleteTaskId}
        />
      ) : null}

      {!loading && viewMode === "kanban" ? (
        <TasksKanbanBoard
          tasks={sortedTasks}
          kanbanMobileColumn={kanbanMobileColumn}
          setKanbanMobileColumn={setKanbanMobileColumn}
          kanbanColRefs={kanbanColRefs}
          onDropToState={onDropToState}
          onDragStartTask={setDragTaskId}
          onOpenTaskDetails={(task) => setSelectedTaskId(task.id)}
          onOpenDescription={setViewDescriptionTask}
          onEditTask={openEditDialog}
          onDeleteTask={setDeleteTaskId}
          labels={{
            kanbanColumn: t("kanbanColumn"),
            more: t("more"),
            unassigned: t("unassigned"),
            due: t("due"),
            edit: tCommon("edit"),
            delete: tCommon("delete"),
          }}
          tEpicStatus={(key) => tEpic(key)}
          tSprintStatus={(key) => tSprints(key)}
        />
      ) : null}

      <TaskDetailsSheet
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onEdit={openEditDialog}
        onDelete={(task) => setDeleteTaskId(task.id)}
        labels={{
          unassigned: t("unassigned"),
          issue: t("columnIssue"),
          noDescription: t("noDescription"),
          actions: t("actions"),
          state: t("state"),
          priority: t("priority"),
          assignee: t("assignee"),
          epic: t("epic"),
          sprint: t("sprint"),
          dueDate: t("dueDate"),
          open: tCommon("open"),
          refresh: tCommon("refresh"),
          edit: tCommon("edit"),
          delete: tCommon("delete"),
        }}
      />

      <TaskDialogs
        createOpen={createOpen}
        onCreateOpenChange={setCreateOpen}
        editingTask={editingTask}
        onEditOpenChange={(open) => (open ? null : closeDialogs())}
        viewDescriptionTask={viewDescriptionTask}
        onViewDescriptionOpenChange={(open) => (open ? null : setViewDescriptionTask(null))}
        deleteTaskId={deleteTaskId}
        onDeleteOpenChange={(open) => (open ? null : setDeleteTaskId(null))}
        onCloseDialogs={closeDialogs}
        onCancelDelete={() => setDeleteTaskId(null)}
        onSubmitCreate={submitCreate}
        onSubmitEdit={submitEdit}
        onConfirmDelete={confirmDelete}
        submitting={submitting}
        form={form}
        setForm={setForm}
        formError={formError}
        members={members}
        membersLoading={membersLoading}
        epics={activeEpics}
        epicsLoading={epicsLoading}
        sprints={allSprints}
        sprintsLoading={sprintsLoading}
        sprintPickerLabels={{
          none: tSprints("sprintPickerNone"),
          search: tSprints("sprintPickerSearch"),
          empty: tSprints("sprintPickerEmpty"),
        }}
        labels={{
          createIssue: t("createIssue"),
          createIssueDesc: t("createIssueDesc"),
          editIssue: t("editIssue"),
          editIssueDesc: t("editIssueDesc"),
          noDescription: t("noDescription"),
          deleteIssue: t("deleteIssue"),
          deleteIssueDesc: t("deleteIssueDesc"),
          create: tCommon("create"),
          save: tCommon("save"),
          cancel: tCommon("cancel"),
          delete: tCommon("delete"),
        }}
      />
    </div>
  );
}
