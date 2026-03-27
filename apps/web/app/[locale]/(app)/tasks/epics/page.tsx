"use client";

import { EpicsListModule } from "@/components/tasks/epics-list-module";
import { useProjectContext } from "@/lib/context/project-context";

export default function EpicsPage() {
  const { selectedProject } = useProjectContext();
  if (!selectedProject) {
    return null;
  }
  return <EpicsListModule projectId={selectedProject.id} />;
}
