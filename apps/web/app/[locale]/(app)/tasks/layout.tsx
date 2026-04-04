"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useProjectContext } from "@/lib/context/project-context";
import { Button } from "@amb-app/ui/components/button";
import { EmptyState } from "@amb-app/ui/components/empty-state";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderTitle,
} from "@amb-app/ui/components/page-header";
import { useTranslations } from "next-intl";
import { FolderKanbanIcon } from "lucide-react";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return <TasksLayoutInner>{children}</TasksLayoutInner>;
}

function TasksLayoutInner({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Tasks");
  const tDash = useTranslations("Dashboard");
  const { selectedProject, loading, projects } = useProjectContext();
  const pathname = usePathname();
  const sectionHeading = pathname.includes("/tasks/epics")
    ? t("navEpics")
    : pathname.includes("/tasks/sprints")
      ? t("navSprints")
      : t("navAllIssues");

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!selectedProject) {
    const noProjectsYet = projects.length === 0;
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <EmptyState
          icon={<FolderKanbanIcon className="size-6" />}
          title={noProjectsYet ? tDash("emptyStateTitle") : t("selectProject")}
          description={
            noProjectsYet ? (
              <span>
                {tDash("emptyStateDescription")}
                <br />
                {tDash("emptyStateHint")}
              </span>
            ) : undefined
          }
          action={
            <Button variant="outline" asChild>
              <Link href="/">{t("toDashboard")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="tasks-workspace-surface amb-glass-surface flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="tasks-workspace-inner min-h-0 min-w-0 flex-1 overflow-auto px-5 py-4 md:px-6 md:py-5">
        <PageHeader className="border-b-0 pb-3">
          <PageHeaderContent>
            <PageHeaderEyebrow>{t("tasksTitle")}</PageHeaderEyebrow>
            <PageHeaderTitle className="font-display text-base sm:text-lg">{sectionHeading}</PageHeaderTitle>
            <PageHeaderDescription className="truncate">
              {t("projectLabel")} <span className="font-medium text-foreground">{selectedProject.name}</span>
            </PageHeaderDescription>
          </PageHeaderContent>
        </PageHeader>

        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
}
