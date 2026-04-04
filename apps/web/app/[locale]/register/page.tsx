import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth/constants";
import { decodeJwtPayload, isJwtExpired } from "@/lib/auth/jwt";
import { sanitizeNextPathFull } from "@/lib/auth/sanitize-next-path";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ params, searchParams }: Props) {
  const [{ locale }, { next }] = await Promise.all([params, searchParams]);
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && !isJwtExpired(payload)) {
      redirect(sanitizeNextPathFull(next, locale));
    }
  }

  return <RegisterForm />;
}
