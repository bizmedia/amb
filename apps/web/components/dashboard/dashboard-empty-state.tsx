"use client";

import { FolderKanbanIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function DashboardEmptyState() {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <FolderKanbanIcon className="size-7 text-muted-foreground" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">{t("emptyStateTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("emptyStateDescription")}</p>
        <p className="text-sm text-muted-foreground">{t("emptyStateHint")}</p>
      </div>
    </div>
  );
}
