"use client";

import { useParams } from "next/navigation";
import { EpicDetailModule } from "@/components/tasks/epic-detail-module";
import { useProjectContext } from "@/lib/context/project-context";

export default function EpicDetailPage() {
  const params = useParams();
  const epicId = typeof params.epicId === "string" ? params.epicId : "";
  const { selectedProject } = useProjectContext();
  if (!selectedProject || !epicId) {
    return null;
  }
  return <EpicDetailModule projectId={selectedProject.id} epicId={epicId} />;
}
