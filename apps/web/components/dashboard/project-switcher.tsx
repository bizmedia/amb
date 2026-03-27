"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderKanbanIcon,
  PlusIcon,
  CopyIcon,
  CheckIcon,
  ChevronDownIcon,
  Building2Icon,
  PencilIcon,
  Loader2Icon,
  Trash2Icon,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useProjectContext } from "@/lib/context/project-context";
import { getLocalizedApiErrorFromCode } from "@/lib/api/error-i18n";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export function ProjectToolbarQuickActions() {
  const t = useTranslations("ProjectSwitcher");
  const { selectedProject } = useProjectContext();
  const [copied, setCopied] = useState(false);

  const copyProjectId = async () => {
    if (!selectedProject) return;
    await navigator.clipboard.writeText(selectedProject.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={copyProjectId}
        disabled={!selectedProject}
        className="gap-2"
        title={t("copyProjectId")}
      >
        {copied ? <CheckIcon className="size-4 text-green-500" /> : <CopyIcon className="size-4" />}
        <span className="hidden sm:inline">ID</span>
      </Button>
    </div>
  );
}

export function ProjectSwitcher() {
  const t = useTranslations("ProjectSwitcher");
  const tDash = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const { setProjectId, projects, loading, selectedProject, loadProjects: reloadProjects, deleteProject } = useProjectContext();
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantFilter, setTenantFilter] = useState<string | "ALL">("ALL");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [editTaskPrefix, setEditTaskPrefix] = useState("");
  const [baselineTaskPrefix, setBaselineTaskPrefix] = useState<string | null>(null);
  const [prefixDuplicate, setPrefixDuplicate] = useState(false);
  const [prefixCheckPending, setPrefixCheckPending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deleteProjectError, setDeleteProjectError] = useState<string | null>(null);

  const loadTenants = async () => {
    setTenantsLoading(true);
    try {
      const res = await fetch("/api/tenants");
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data) {
        setTenants(json.data as Tenant[]);
      }
    } finally {
      setTenantsLoading(false);
    }
  };

  const openManageDialog = async () => {
    setManageOpen(true);
    if (tenants.length === 0) {
      await loadTenants();
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (tenantFilter === "ALL") return true;
    return project.tenantId === tenantFilter;
  });

  const selectProject = (id: string) => {
    setProjectId(id);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setCreateError(getLocalizedApiErrorFromCode(json?.error?.code, tCommon));
        return;
      }

      await reloadProjects();
      await loadTenants();
      setNewProjectName("");
      setDialogOpen(false);
      selectProject(json.data.id);
    } finally {
      setCreating(false);
    }
  };

  const startEditProject = (
    projectId: string,
    currentName: string,
    currentTaskPrefix: string | null | undefined,
  ) => {
    setEditingProjectId(projectId);
    setEditProjectName(currentName);
    const p = (currentTaskPrefix ?? "").toUpperCase();
    setEditTaskPrefix(p);
    setBaselineTaskPrefix(p || null);
    setPrefixDuplicate(false);
    setEditError(null);
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setEditProjectName("");
    setEditTaskPrefix("");
    setBaselineTaskPrefix(null);
    setPrefixDuplicate(false);
    setPrefixCheckPending(false);
    setEditError(null);
  };

  const prefixFormatValid = /^[A-Z]{2,5}$/.test(editTaskPrefix);
  const showPrefixFormatError = editTaskPrefix.length > 0 && !prefixFormatValid;
  const showPrefixChangeWarning =
    Boolean(baselineTaskPrefix && baselineTaskPrefix.length >= 2) &&
    prefixFormatValid &&
    editTaskPrefix !== baselineTaskPrefix;

  useEffect(() => {
    if (!editingProjectId) {
      return;
    }
    const p = editTaskPrefix.trim().toUpperCase();
    if (!/^[A-Z]{2,5}$/.test(p)) {
      setPrefixDuplicate(false);
      setPrefixCheckPending(false);
      return;
    }

    setPrefixCheckPending(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/projects");
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.data) {
          setPrefixDuplicate(false);
          return;
        }
        const list = json.data as Array<{ id: string; taskPrefix?: string | null }>;
        const taken = list.some(
          (proj) =>
            proj.id !== editingProjectId &&
            (proj.taskPrefix?.toUpperCase() ?? "") === p,
        );
        setPrefixDuplicate(taken);
      } finally {
        setPrefixCheckPending(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [editTaskPrefix, editingProjectId]);

  const saveProjectSettings = async () => {
    if (!editingProjectId || !editProjectName.trim()) return;
    if (!prefixFormatValid) {
      setEditError(t("taskPrefixInvalidFormat"));
      return;
    }
    if (prefixDuplicate) {
      setEditError(t("taskPrefixDuplicate", { prefix: editTaskPrefix }));
      return;
    }
    setEditing(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/projects/${editingProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editProjectName.trim(),
          taskPrefix: editTaskPrefix,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setEditError(getLocalizedApiErrorFromCode(json?.error?.code, tCommon));
        return;
      }
      await reloadProjects();
      cancelEditProject();
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeletingProject(true);
    setDeleteProjectError(null);
    try {
      await deleteProject(projectToDelete.id);
      setDeleteProjectDialogOpen(false);
      setProjectToDelete(null);
      setManageOpen(false);
    } catch (err) {
      setDeleteProjectError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setDeletingProject(false);
    }
  };

  const triggerLabel = loading ? t("loadingProjects") : (selectedProject?.name ?? t("selectProject"));

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className="h-10 data-[state=open]:bg-sidebar-accent/90 data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl"
                tooltip={triggerLabel}
              >
                <div className="amb-sidebar-brand-mark flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-primary-foreground group-data-[collapsible=icon]:size-9">
                  <FolderKanbanIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{triggerLabel}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{tDash("subtitle")}</span>
                </div>
                <ChevronDownIcon className="ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[320px]">
              <DropdownMenuItem asChild>
                <Link href="/" className="flex cursor-pointer items-center gap-2">
                  <LayoutDashboard className="size-4" />
                  {tDash("title")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="max-h-[280px] overflow-y-auto overflow-x-hidden p-1">
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => selectProject(project.id)}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate">{project.name}</span>
                {selectedProject?.id === project.id && (
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {t("current")}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PlusIcon className="size-4 mr-2" />
                {t("createProject")}
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("newProject")}</DialogTitle>
                <DialogDescription>
                  {t("newProjectDesc")}
                </DialogDescription>
              </DialogHeader>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
              <Input
                placeholder={t("projectNamePlaceholder")}
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    createProject();
                  }
                }}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button onClick={createProject} disabled={!newProjectName.trim() || creating}>
                  {tCommon("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()} onClick={openManageDialog}>
            <Building2Icon className="size-4 mr-2" />
            {t("manageProjects")}
          </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-[840px]">
          <DialogHeader>
            <DialogTitle>{t("manageTitle")}</DialogTitle>
            <DialogDescription>{t("manageDesc")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("tenants")}</p>
              <div className="rounded-md border p-2 space-y-1 max-h-[280px] overflow-y-auto">
                <Button
                  size="sm"
                  variant={tenantFilter === "ALL" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setTenantFilter("ALL")}
                >
                  {t("allTenants")}
                </Button>
                {tenantsLoading ? (
                  <p className="text-xs text-muted-foreground px-2 py-1">{tCommon("loading")}</p>
                ) : (
                  tenants.map((tenant) => (
                    <Button
                      key={tenant.id}
                      size="sm"
                      variant={tenantFilter === tenant.id ? "default" : "ghost"}
                      className="w-full justify-start truncate"
                      onClick={() => setTenantFilter(tenant.id)}
                    >
                      {tenant.name}
                    </Button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("projects")}</p>
              <div className="rounded-md border p-2 space-y-2 max-h-[360px] overflow-y-auto">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="rounded-md border bg-card p-2">
                    {editingProjectId === project.id ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">{t("projectNameLabel")}</p>
                          <Input
                            value={editProjectName}
                            onChange={(event) => setEditProjectName(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") void saveProjectSettings();
                              if (event.key === "Escape") cancelEditProject();
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">{t("taskKeyPrefixLabel")}</p>
                          <Input
                            className="max-w-[120px] font-mono uppercase tracking-wider"
                            value={editTaskPrefix}
                            onChange={(event) => {
                              const v = event.target.value
                                .replace(/[^a-zA-Z]/g, "")
                                .toUpperCase()
                                .slice(0, 5);
                              setEditTaskPrefix(v);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") void saveProjectSettings();
                              if (event.key === "Escape") cancelEditProject();
                            }}
                            spellCheck={false}
                            autoCapitalize="characters"
                            aria-invalid={showPrefixFormatError || prefixDuplicate}
                          />
                          <p className="text-xs text-muted-foreground">
                            {t("taskKeyPrefixPreview", {
                              sample: prefixFormatValid ? editTaskPrefix : "PPP",
                            })}
                          </p>
                          {!baselineTaskPrefix && editTaskPrefix.length === 0 ? (
                            <p className="text-xs text-muted-foreground">{t("taskKeyPrefixHintEmpty")}</p>
                          ) : null}
                          {showPrefixFormatError ? (
                            <p className="text-xs text-destructive">{t("taskPrefixInvalidFormat")}</p>
                          ) : null}
                          {prefixDuplicate ? (
                            <p className="text-xs text-destructive">
                              {t("taskPrefixDuplicate", { prefix: editTaskPrefix })}
                            </p>
                          ) : null}
                          {prefixCheckPending && prefixFormatValid && !prefixDuplicate ? (
                            <p className="text-xs text-muted-foreground">{t("taskPrefixChecking")}</p>
                          ) : null}
                          {showPrefixChangeWarning ? (
                            <div
                              className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-950 dark:text-amber-100"
                              role="status"
                            >
                              {t("taskPrefixChangeWarning")}
                            </div>
                          ) : null}
                        </div>
                        {editError ? <p className="text-xs text-destructive">{editError}</p> : null}
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={cancelEditProject}>
                            {tCommon("cancel")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={saveProjectSettings}
                            disabled={
                              editing || !editProjectName.trim() || !prefixFormatValid || prefixDuplicate
                            }
                          >
                            {tCommon("save")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{project.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{project.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => selectProject(project.id)}>
                            {selectedProject?.id === project.id ? t("selected") : t("switchTo")}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              startEditProject(project.id, project.name, project.taskPrefix)
                            }
                            title={t("editProject")}
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setProjectToDelete({ id: project.id, name: project.name });
                              setDeleteProjectDialogOpen(true);
                            }}
                            title={t("deleteProject")}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noProjectsForTenant")}</p>
                ) : null}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteProjectDialogOpen}
        onOpenChange={(open) => {
          setDeleteProjectDialogOpen(open);
          if (!open) setDeleteProjectError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteProjectTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteProjectConfirm", { name: projectToDelete?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          {deleteProjectError && (
            <p className="text-sm text-destructive">{deleteProjectError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProjectDialogOpen(false)} disabled={deletingProject}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={deletingProject}>
              {deletingProject ? <Loader2Icon className="size-4 animate-spin" /> : tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
