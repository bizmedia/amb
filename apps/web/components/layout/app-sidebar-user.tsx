"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BookOpenIcon,
  ChevronsUpDown,
  HelpCircleIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  UserRoundIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type SessionUser = {
  userId: string | null;
  email: string | null;
  tenantId: string | null;
  roles: string[];
};

function userInitials(email: string | null, userId: string | null): string {
  const e = email?.trim();
  if (e) {
    const local = e.split("@")[0] ?? "";
    const letters = local.replace(/[^a-zA-Z0-9]/g, "");
    if (letters.length >= 2) return letters.slice(0, 2).toUpperCase();
    if (letters.length === 1) return `${letters}${letters}`.toUpperCase();
    if (local.length >= 2) return local.slice(0, 2).toUpperCase();
    if (local.length === 1) return `${local}${local}`.toUpperCase();
  }
  if (!userId?.trim()) return "?";
  const s = userId.trim();
  if (s.length <= 2) return s.toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

export function AppSidebarUser() {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const json = await response.json().catch(() => null);
        if (!isMounted) return;
        if (json?.data?.authenticated) {
          setUser({
            userId: json.data.userId ?? null,
            email: typeof json.data.email === "string" ? json.data.email : null,
            tenantId: json.data.tenantId ?? null,
            roles: Array.isArray(json.data.roles) ? json.data.roles : [],
          });
        } else {
          setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const setLocale = useCallback(
    (newLocale: string) => {
      document.cookie = `NEXT_LOCALE=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
      window.localStorage.setItem("amb:locale", newLocale);
      router.replace(pathname, { locale: newLocale });
    },
    [router, pathname],
  );

  const redirectToLogin = useCallback(() => {
    const nextPath = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/${locale}/login?next=${encodeURIComponent(nextPath)}`;
  }, [locale]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      redirectToLogin();
    }
  }, [redirectToLogin]);

  const displayName =
    user?.email?.trim() || user?.userId?.trim() || t("sidebarUserFallback");
  const subtitle =
    user?.roles?.length ? user.roles.join(", ") : user?.tenantId?.trim() || t("sidebarUserHint");

  if (loading) {
    return (
      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSkeleton showIcon className="h-12" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarFooter className="border-t border-sidebar-border/60 p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                tooltip={t("sidebarUserMenu")}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
                  <span className="text-xs font-semibold">
                    {userInitials(user.email, user.userId)}
                  </span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{subtitle}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 shrink-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-lg" side="top" align="start" sideOffset={4}>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <UserRoundIcon className="size-4" />
                  {t("profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme} className="gap-2">
                {resolvedTheme === "dark" ? (
                  <SunIcon className="size-4" />
                ) : (
                  <MoonIcon className="size-4" />
                )}
                {resolvedTheme === "dark" ? t("lightTheme") : t("darkTheme")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api-docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <BookOpenIcon className="size-4" />
                  {t("apiDocs")}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help" className="flex items-center gap-2">
                  <HelpCircleIcon className="size-4" />
                  {t("help")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">{tCommon("language")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {routing.locales.map((loc) => (
                    <DropdownMenuItem
                      key={loc}
                      onClick={() => setLocale(loc)}
                      className={locale === loc ? "bg-accent" : ""}
                    >
                      {loc === "en" ? "English" : loc === "ru" ? "Русский" : loc === "de" ? "Deutsch" : loc}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2">
                <LogOutIcon className="size-4" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
