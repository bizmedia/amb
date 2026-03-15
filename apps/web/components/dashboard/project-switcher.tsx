"use client";

import { useState } from "react";
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
  ListTodoIcon,
  Building2Icon,
  PencilIcon,
  KeyRoundIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

import { useProjectContext } from "@/lib/context/project-context";
import { getLocalizedApiErrorFromCode } from "@/lib/api/error-i18n";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export function ProjectSwitcher() {
  const t = useTranslations("ProjectSwitcher");
  const tCommon = useTranslations("Common");
  const { setProjectId, projects, loading, selectedProject, loadProjects: reloadProjects } = useProjectContext();
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantFilter, setTenantFilter] = useState<string | "ALL">("ALL");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const copyProjectId = async () => {
    if (!selectedProject) return;
    await navigator.clipboard.writeText(selectedProject.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const startEditProject = (projectId: string, currentName: string) => {
    setEditingProjectId(projectId);
    setEditProjectName(currentName);
    setEditError(null);
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setEditProjectName("");
    setEditError(null);
  };

  const saveProjectName = async () => {
    if (!editingProjectId || !editProjectName.trim()) return;
    setEditing(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/projects/${editingProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editProjectName.trim() }),
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

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FolderKanbanIcon className="size-4" />
            <span className="max-w-[180px] truncate">
              {loading ? t("loadingProjects") : (selectedProject?.name ?? t("selectProject"))}
            </span>
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[320px]">
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

      {selectedProject ? (
        <>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/tasks">
              <ListTodoIcon className="size-4" />
              <span className="hidden sm:inline">{t("tasks")}</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/tokens">
              <KeyRoundIcon className="size-4" />
              <span className="hidden sm:inline">{t("tokens")}</span>
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" size="sm" disabled className="gap-2">
            <ListTodoIcon className="size-4" />
            <span className="hidden sm:inline">{t("tasks")}</span>
          </Button>
          <Button variant="outline" size="sm" disabled className="gap-2">
            <KeyRoundIcon className="size-4" />
            <span className="hidden sm:inline">{t("tokens")}</span>
          </Button>
        </>
      )}

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle>{t("manageTitle")}</DialogTitle>
            <DialogDescription>{t("manageDesc")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
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
                      <div className="space-y-2">
                        <Input
                          value={editProjectName}
                          onChange={(event) => setEditProjectName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") void saveProjectName();
                            if (event.key === "Escape") cancelEditProject();
                          }}
                        />
                        {editError ? <p className="text-xs text-destructive">{editError}</p> : null}
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={cancelEditProject}>
                            {tCommon("cancel")}
                          </Button>
                          <Button size="sm" onClick={saveProjectName} disabled={editing || !editProjectName.trim()}>
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
                            onClick={() => startEditProject(project.id, project.name)}
                            title={t("editProject")}
                          >
                            <PencilIcon className="size-4" />
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
    </div>
  );
}
