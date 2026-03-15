import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth/constants";
import { decodeJwtPayload, isJwtExpired } from "@/lib/auth/jwt";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

function sanitizeNextPath(nextValue: string | undefined, locale: string): string {
  if (!nextValue || !nextValue.startsWith(`/${locale}`)) {
    return `/${locale}`;
  }
  return nextValue;
}

export default async function LoginPage({ params, searchParams }: Props) {
  const [{ locale }, { next }] = await Promise.all([params, searchParams]);
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && !isJwtExpired(payload)) {
      redirect(sanitizeNextPath(next, locale));
    }
  }

  return <LoginForm />;
}
