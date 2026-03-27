"use client";

import { SprintsListModule } from "@/components/tasks/sprints-list-module";
import { useProjectContext } from "@/lib/context/project-context";

export default function SprintsPage() {
  const { selectedProject } = useProjectContext();
  if (!selectedProject) {
    return null;
  }
  return <SprintsListModule projectId={selectedProject.id} />;
}
