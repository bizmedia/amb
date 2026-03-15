"use client";

import { useTranslations } from "next-intl";

type DescriptionEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  minHeight?: string;
};

export function DescriptionEditor({
  value,
  onChange,
  placeholder,
  minHeight = "12rem",
}: DescriptionEditorProps) {
  const t = useTranslations("Ui");
  const resolvedPlaceholder = placeholder ?? t("descriptionPlaceholder");
  return (
    <textarea
      className="min-h-48 w-full rounded-md border bg-transparent px-3 py-2 font-mono text-sm"
      placeholder={resolvedPlaceholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      style={{ minHeight }}
    />
  );
}
