"use client";

import { ArrowLeftIcon } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-xl px-4 py-6 md:px-8">
        <div className="mb-4">
          <Button asChild variant="ghost" size="sm" className="gap-2 px-2">
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              {t("backToDashboard")}
            </Link>
          </Button>
        </div>

        <TokensModule projectId={selectedProject.id} projectName={selectedProject.name} />
      </div>
    </div>
  );
}
