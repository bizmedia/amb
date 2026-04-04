/** Path for `next-intl` router.replace (locale prefix omitted). */
export function sanitizeNextPathForRouter(nextValue: string | null, locale: string): string {
  if (!nextValue || !nextValue.startsWith(`/${locale}`)) {
    return "/";
  }

  const withoutLocale = nextValue.slice(`/${locale}`.length);
  if (!withoutLocale || withoutLocale === "/") {
    return "/";
  }
  return withoutLocale;
}

/** Full path with locale for redirects from server (e.g. login/register pages). */
export function sanitizeNextPathFull(nextValue: string | undefined, locale: string): string {
  if (!nextValue || !nextValue.startsWith(`/${locale}`)) {
    return `/${locale}`;
  }
  return nextValue;
}
