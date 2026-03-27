"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useProjectContext } from "@/lib/context/project-context";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return <TasksLayoutInner>{children}</TasksLayoutInner>;
}

function TasksLayoutInner({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Tasks");
  const { selectedProject, loading } = useProjectContext();
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
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <p className="text-sm text-muted-foreground">{t("selectProject")}</p>
        <Button asChild variant="outline">
          <Link href="/">{t("toDashboard")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="tasks-workspace flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="tasks-workspace-surface amb-glass-surface flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border/50 px-5 py-3.5 md:px-6">
          <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h1 className="font-display text-lg font-semibold tracking-tight sm:text-xl">{sectionHeading}</h1>
            <span className="text-muted-foreground/80">·</span>
            <p className="max-w-[min(100%,36rem)] truncate text-sm text-muted-foreground">
              {t("projectLabel")}{" "}
              <span className="font-medium text-foreground/90">{selectedProject.name}</span>
            </p>
          </div>
        </div>

        <div className="tasks-workspace-inner min-h-0 min-w-0 flex-1 overflow-auto px-5 py-4 md:px-6 md:py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
