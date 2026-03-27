"use client";

import { useTranslations } from "next-intl";
import { BookOpen, CalendarRange, CircleHelp, KeyRound, LayoutList, Layers } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { AppSidebarUser } from "@/components/layout/app-sidebar-user";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

function pathMatches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const tTasks = useTranslations("Tasks");
  const tTokens = useTranslations("Tokens");
  const tHelp = useTranslations("Help");

  const isTasksIssues = pathname === "/tasks" || pathname === "/tasks/";
  const isEpics = pathMatches(pathname, "/tasks/epics");
  const isSprints = pathMatches(pathname, "/tasks/sprints");
  const isTokens = pathMatches(pathname, "/tokens");
  const isHelp = pathMatches(pathname, "/help");

  return (
    <Sidebar variant="floating" collapsible="icon" className="amb-glass-sidebar">
      <SidebarHeader className="h-14 justify-center gap-0 border-b border-sidebar-border/60 p-2">
        <ProjectSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="amb-sidebar-section-label">{tTasks("tasksTitle")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isTasksIssues} tooltip={tTasks("navAllIssues")}>
                  <Link href="/tasks">
                    <LayoutList />
                    <span>{tTasks("navAllIssues")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isEpics} tooltip={tTasks("navEpics")}>
                  <Link href="/tasks/epics">
                    <Layers />
                    <span>{tTasks("navEpics")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isSprints} tooltip={tTasks("navSprints")}>
                  <Link href="/tasks/sprints">
                    <CalendarRange />
                    <span>{tTasks("navSprints")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="amb-sidebar-section-label">{tTokens("title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isTokens} tooltip={tTokens("title")}>
                  <Link href="/tokens">
                    <KeyRound />
                    <span>{tTokens("title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="amb-sidebar-section-label">{tHelp("title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isHelp && !pathname.includes("/help/use-cases")}
                  tooltip={tHelp("title")}
                >
                  <Link href="/help">
                    <CircleHelp />
                    <span>{tHelp("title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/help/use-cases")} tooltip={tHelp("useCases")}>
                  <Link href="/help/use-cases">
                    <BookOpen />
                    <span>{tHelp("useCases")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <AppSidebarUser />

      <SidebarRail />
    </Sidebar>
  );
}
