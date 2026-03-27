"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "amb-project-id";

export type Project = {
  id: string;
  tenantId?: string | null;
  name: string;
  slug: string;
  taskPrefix?: string | null;
  createdAt: string;
};

type ProjectContextValue = {
  projectId: string | null;
  setProjectId: (id: string) => void;
  projects: Project[];
  loading: boolean;
  selectedProject: Project | null;
  loadProjects: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectIdState] = useState<string | null>(null);

  const reloadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (res.ok && json?.data) {
        setProjects(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadProjects();
  }, [reloadProjects]);

  useEffect(() => {
    if (loading) return;
    if (projects.length === 0) {
      setProjectIdState(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [loading, projects]);

  const setProjectId = useCallback((id: string) => {
    setProjectIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const deleteProject = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error((json?.error?.message as string) ?? "Failed to delete project");
      }
      if (projectId === id) {
        setProjectIdState(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      await reloadProjects();
    },
    [projectId, reloadProjects]
  );

  useEffect(() => {
    if (loading || projects.length === 0) return;

    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const exists = stored && projects.some((p) => p.id === stored);

    if (exists && stored) {
      setProjectIdState(stored);
    } else {
      const first = projects[0];
      if (first) {
        setProjectIdState(first.id);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, first.id);
        }
      }
    }
  }, [loading, projects]);

  const selectedProject =
    projectId && projects.length > 0
      ? (projects.find((p) => p.id === projectId) ?? projects[0] ?? null)
      : null;

  const value: ProjectContextValue = {
    projectId,
    setProjectId,
    projects,
    loading,
    selectedProject,
    loadProjects: reloadProjects,
    deleteProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjectContext must be used within ProjectProvider");
  }
  return ctx;
}

export function useProjectId(): string | null {
  return useProjectContext().projectId;
}
