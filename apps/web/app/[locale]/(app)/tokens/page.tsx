"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useProjectContext } from "@/lib/context/project-context";
import { TokensModule } from "@/components/tokens/tokens-module";
import { Button } from "@/components/ui/button";

export default function TokensPage() {
  const t = useTranslations("Tokens");
  const { selectedProject, loading } = useProjectContext();

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
    <div className="flex flex-1 flex-col overflow-auto bg-background">
      <div className="w-full px-5 py-4 md:px-6 md:py-5">
        <TokensModule projectId={selectedProject.id} projectName={selectedProject.name} />
      </div>
    </div>
  );
}
