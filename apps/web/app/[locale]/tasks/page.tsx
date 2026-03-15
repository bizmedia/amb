"use client";

import { Link } from "@/i18n/navigation";
import { useProjectContext } from "@/lib/context/project-context";
import { TasksModule } from "@/components/tasks/tasks-module";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TasksPage() {
  const t = useTranslations("Tasks");
  const { selectedProject, loading } = useProjectContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-muted-foreground">{t("selectProject")}</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeftIcon className="mr-2 size-4" />
            {t("toDashboard")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <TasksModule projectId={selectedProject.id} projectName={selectedProject.name} />
  );
}
