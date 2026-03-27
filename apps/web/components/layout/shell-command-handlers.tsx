"use client";

import * as React from "react";

export type DashboardCommandTab = "messages" | "inbox" | "dlq";

export type ShellDashboardCommandHandlers = {
  onNavigate: (tab: DashboardCommandTab) => void;
  onNewThread: () => void;
  onRefresh: () => void;
};

const ShellCommandHandlersRefContext = React.createContext<React.MutableRefObject<ShellDashboardCommandHandlers | null> | null>(
  null,
);

export function ShellCommandHandlersProvider({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<ShellDashboardCommandHandlers | null>(null);
  return (
    <ShellCommandHandlersRefContext.Provider value={ref}>{children}</ShellCommandHandlersRefContext.Provider>
  );
}

export function useShellCommandHandlersRef() {
  const ctx = React.useContext(ShellCommandHandlersRefContext);
  if (!ctx) {
    throw new Error("useShellCommandHandlersRef must be used within ShellCommandHandlersProvider");
  }
  return ctx;
}
