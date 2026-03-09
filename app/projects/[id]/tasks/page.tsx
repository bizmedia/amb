import { notFound } from "next/navigation";

import { TasksModule } from "@/components/tasks/tasks-module";
import { getProjectById } from "@/lib/services/projects";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TasksPage({ params }: PageProps) {
  const { id } = await params;
  let project: Awaited<ReturnType<typeof getProjectById>>;

  try {
    project = await getProjectById(id);
  } catch {
    notFound();
  }

  return <TasksModule projectId={project.id} projectName={project.name} />;
}
