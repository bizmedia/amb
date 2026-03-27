import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile");
  return {
    title: `${t("title")} — Agent Message Bus`,
    description: t("accountSectionDesc"),
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
