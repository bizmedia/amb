"use client";

import { useParams } from "next/navigation";
import { SprintDetailModule } from "@/components/tasks/sprint-detail-module";
import { useProjectContext } from "@/lib/context/project-context";

export default function SprintDetailPage() {
  const params = useParams();
  const sprintId = typeof params.sprintId === "string" ? params.sprintId : "";
  const { selectedProject } = useProjectContext();
  if (!selectedProject || !sprintId) {
    return null;
  }
  return <SprintDetailModule projectId={selectedProject.id} sprintId={sprintId} />;
}
