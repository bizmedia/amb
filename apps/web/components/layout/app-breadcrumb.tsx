"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppBreadcrumb() {
  const pathname = usePathname();
  const tDash = useTranslations("Dashboard");
  const tTasks = useTranslations("Tasks");
  const tTokens = useTranslations("Tokens");
  const tHelp = useTranslations("Help");
  const tProfile = useTranslations("Profile");

  if (!pathname || pathname === "/") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{tDash("title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (pathname.startsWith("/tasks")) {
    const isEpics = pathname.startsWith("/tasks/epics");
    const isSprints = pathname.startsWith("/tasks/sprints");
    const isIssuesRoot = pathname === "/tasks" || pathname === "/tasks/";
    const epicDetail = isEpics && pathname !== "/tasks/epics" && pathname !== "/tasks/epics/";
    const sprintDetail = isSprints && pathname !== "/tasks/sprints" && pathname !== "/tasks/sprints/";

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/">{tDash("title")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/tasks">{tTasks("tasksTitle")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {isIssuesRoot ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{tTasks("navAllIssues")}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : null}
          {isEpics ? (
            <>
              <BreadcrumbItem>
                {epicDetail ? (
                  <BreadcrumbLink asChild>
                    <Link href="/tasks/epics">{tTasks("navEpics")}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{tTasks("navEpics")}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {epicDetail ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{tTasks("epic")}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : null}
            </>
          ) : null}
          {isSprints ? (
            <>
              <BreadcrumbItem>
                {sprintDetail ? (
                  <BreadcrumbLink asChild>
                    <Link href="/tasks/sprints">{tTasks("navSprints")}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{tTasks("navSprints")}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {sprintDetail ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{tTasks("sprint")}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : null}
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (pathname.startsWith("/tokens")) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/">{tDash("title")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{tTokens("title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (pathname.startsWith("/profile")) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/">{tDash("title")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{tProfile("title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (pathname.startsWith("/help")) {
    const useCases = pathname.includes("/help/use-cases");
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/">{tDash("title")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            {useCases ? (
              <BreadcrumbLink asChild>
                <Link href="/help">{tHelp("title")}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{tHelp("title")}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {useCases ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{tHelp("useCases")}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{tDash("title")}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
