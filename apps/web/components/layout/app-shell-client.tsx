"use client";

import dynamic from "next/dynamic";

export const AppShellClient = dynamic(
  () => import("@/components/layout/app-shell").then((module) => module.AppShell),
  {
    ssr: false,
    loading: () => <div className="min-h-svh bg-background" />,
  }
);
