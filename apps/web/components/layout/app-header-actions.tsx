"use client";

import { useCallback, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BookOpenIcon,
  CommandIcon,
  HelpCircleIcon,
  LogOutIcon,
  MoreVerticalIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";

import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { ProjectToolbarQuickActions } from "@/components/dashboard/project-switcher";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/components/theme-provider";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useSSE } from "@/lib/hooks/use-sse";
import { useShellCommandHandlersRef } from "@/components/layout/shell-command-handlers";

export function AppHeaderActions() {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { connected } = useSSE();
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const handlersRef = useShellCommandHandlersRef();

  const toggleTheme = useCallback(() => {
    const currentResolved = resolvedTheme;
    setTheme(currentResolved === "dark" ? "light" : "dark");
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

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) {
          if (isMounted) redirectToLogin();
          return;
        }
        const json = await response.json().catch(() => null);
        if (!json?.data?.authenticated && isMounted) {
          redirectToLogin();
        }
      } catch {
        /* ignore transient network errors */
      }
    };

    void checkSession();
    const intervalId = setInterval(() => {
      void checkSession();
    }, 60_000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [redirectToLogin]);

  const handleRefresh = useCallback(() => {
    const h = handlersRef.current;
    if (h) {
      h.onRefresh();
    } else {
      window.location.reload();
    }
  }, [handlersRef]);

  return (
    <>
      <div className="ml-auto flex items-center gap-2">
        <ProjectToolbarQuickActions />

        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="flex size-8 items-center justify-center rounded-md border-0 bg-transparent"
              aria-label={connected ? t("sseConnected") : t("reconnecting")}
            >
              <span
                className={`block size-2 rounded-full ${connected ? "animate-pulse bg-green-500" : "bg-yellow-500"}`}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {connected ? t("sseConnected") : t("reconnecting")}
            {connected && ` — ${t("realtime")}`}
          </TooltipContent>
        </Tooltip>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCommandOpen(true)}
          className="gap-2 text-muted-foreground"
        >
          <CommandIcon className="size-4" />
          <span className="hidden sm:inline">{t("commands")}</span>
          <kbd className="ml-1 hidden h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="size-9"
          title={resolvedTheme === "dark" ? t("lightTheme") : t("darkTheme")}
        >
          {resolvedTheme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9" title={t("more")}>
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
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
      </div>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onNavigate={(tab) => {
          const h = handlersRef.current;
          if (h) {
            h.onNavigate(tab);
          } else {
            router.push("/");
          }
        }}
        onNewThread={() => {
          const h = handlersRef.current;
          if (h) {
            h.onNewThread();
          } else {
            router.push("/");
          }
        }}
        onRefresh={handleRefresh}
      />
    </>
  );
}
