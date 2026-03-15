import { Dashboard } from "@/components/dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth/constants";
import { decodeJwtPayload, isJwtExpired } from "@/lib/auth/jwt";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}`)}`);
  }

  const payload = decodeJwtPayload(token);
  if (!payload || isJwtExpired(payload)) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}`)}`);
  }

  return <Dashboard />;
}
