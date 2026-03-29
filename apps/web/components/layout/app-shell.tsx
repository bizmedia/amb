"use client";

import { AppBreadcrumb } from "@/components/layout/app-breadcrumb";
import { AppHeaderActions } from "@/components/layout/app-header-actions";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ShellCommandHandlersProvider } from "@/components/layout/shell-command-handlers";
import { Separator } from "@amb-app/ui/components/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@amb-app/ui/components/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellCommandHandlersProvider>
      <SidebarProvider
        className="amb-shell-stage h-svh min-h-0 overflow-hidden"
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
            "--header-height": "3.5rem",
          } as React.CSSProperties
        }
      >
        <div aria-hidden className="amb-shell-background" />
        <AppSidebar />
        <SidebarInset className="amb-app-inset amb-shell-inset flex h-svh min-h-0 flex-col overflow-hidden">
          <header className="amb-shell-panel amb-shell-header sticky top-2 z-30 mb-3 flex h-14 shrink-0 items-center gap-2.5 overflow-hidden px-4 transition-[height] duration-200 ease-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:mx-3 md:mb-4 md:mt-3 md:rounded-xl md:px-5 md:top-3">
            <SidebarTrigger className="-ml-0.5" />
            <Separator orientation="vertical" className="mr-1.5 h-6 data-[orientation=vertical]:h-4" />
            <div className="min-w-0 flex-1">
              <AppBreadcrumb />
            </div>
            <AppHeaderActions />
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-3 md:p-3">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ShellCommandHandlersProvider>
  );
}
