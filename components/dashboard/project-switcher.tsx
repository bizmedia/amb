"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export function ProjectSwitcher() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = useMemo(() => {
    if (projects.length === 0) return null;
    if (!selectedProjectId) return projects[0];
    return projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  }, [projects, selectedProjectId]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setLoadError(json?.error?.message || "Не удалось загрузить проекты");
        return;
      }
      if (json?.data) {
        setProjects(json.data);
        setLoadError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentProjectId = new URLSearchParams(window.location.search).get("projectId");
    setSelectedProjectId(currentProjectId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!selectedProject && !loading) {
      return;
    }

    if (selectedProject && selectedProjectId !== selectedProject.id) {
      const params = new URLSearchParams(window.location.search);
      params.set("projectId", selectedProject.id);
      router.replace(`${pathname}?${params.toString()}`);
      setSelectedProjectId(selectedProject.id);
    }
  }, [selectedProject, selectedProjectId, pathname, router, loading]);

  const selectProject = (projectId: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("projectId", projectId);
    router.push(`${pathname}?${params.toString()}`);
    setSelectedProjectId(projectId);
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
        setCreateError(json?.error?.message || "Не удалось создать проект");
        return;
      }

      await loadProjects();
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

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FolderKanbanIcon className="size-4" />
            <span className="max-w-[180px] truncate">
              {loading ? "Загрузка проектов..." : (selectedProject?.name ?? "Выбрать проект")}
            </span>
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[320px]">
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => selectProject(project.id)}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate">{project.name}</span>
              {selectedProject?.id === project.id && (
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  current
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PlusIcon className="size-4 mr-2" />
                Создать проект
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый проект</DialogTitle>
                <DialogDescription>
                  Создайте проект и используйте его ID в MCP-настройке другого репозитория.
                </DialogDescription>
              </DialogHeader>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
              <Input
                placeholder="Название проекта"
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
                  Отмена
                </Button>
                <Button onClick={createProject} disabled={!newProjectName.trim() || creating}>
                  Создать
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={copyProjectId}
        disabled={!selectedProject}
        className="gap-2"
        title={loadError ? loadError : "Скопировать ID проекта"}
      >
        {copied ? <CheckIcon className="size-4 text-green-500" /> : <CopyIcon className="size-4" />}
        <span className="hidden sm:inline">ID</span>
      </Button>

      {selectedProject ? (
        <Button variant="outline" size="sm" asChild className="gap-2">
          <Link href={`/projects/${selectedProject.id}/tasks`}>
            <ListTodoIcon className="size-4" />
            <span className="hidden sm:inline">Tasks</span>
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled className="gap-2">
          <ListTodoIcon className="size-4" />
          <span className="hidden sm:inline">Tasks</span>
        </Button>
      )}
    </div>
  );
}
