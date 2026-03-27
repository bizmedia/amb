"use client";

import { Suspense } from "react";
import { TasksModule } from "@/components/tasks/tasks-module";
import { useProjectContext } from "@/lib/context/project-context";

export default function TasksPage() {
  const { selectedProject } = useProjectContext();
  if (!selectedProject) {
    return null;
  }
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">…</p>}>
      <TasksModule projectId={selectedProject.id} />
    </Suspense>
  );
}
