import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth/constants";

const intlMiddleware = createMiddleware(routing);

function isProtectedLocalePath(pathname: string, locale: string): boolean {
  const base = `/${locale}`;
  return (
    pathname === base ||
    pathname.startsWith(`${base}/tasks`) ||
    pathname.startsWith(`${base}/tokens`)
  );
}

function isAuthPath(pathname: string, locale: string): boolean {
  return pathname === `/${locale}/login`;
}

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  const locale = routing.locales.find((item) => item === maybeLocale);

  if (locale && isProtectedLocalePath(pathname, locale) && !isAuthPath(pathname, locale)) {
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
