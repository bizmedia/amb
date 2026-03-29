import { AppShellClient } from "@/components/layout/app-shell-client";

export default function AppRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return <AppShellClient>{children}</AppShellClient>;
}
