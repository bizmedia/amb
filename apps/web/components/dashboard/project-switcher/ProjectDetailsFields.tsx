"use client";

import { useTranslations } from "next-intl";
import {
  BotIcon,
  BriefcaseIcon,
  CpuIcon,
  FolderKanbanIcon,
  PackageIcon,
  RocketIcon,
  ShieldIcon,
} from "lucide-react";
import { Button } from "@amb-app/ui/components/button";
import { Input } from "@amb-app/ui/components/input";

export const PROJECT_ICON_STORAGE_KEY = "amb-project-icons";
export const PROJECT_COLOR_STORAGE_KEY = "amb-project-colors";

export const PROJECT_ICON_OPTIONS = [
  { value: "folder-kanban", icon: FolderKanbanIcon },
  { value: "rocket", icon: RocketIcon },
  { value: "briefcase", icon: BriefcaseIcon },
  { value: "bot", icon: BotIcon },
  { value: "cpu", icon: CpuIcon },
  { value: "shield", icon: ShieldIcon },
  { value: "package", icon: PackageIcon },
] as const;

export type ProjectIconValue = (typeof PROJECT_ICON_OPTIONS)[number]["value"];
export type ProjectColorValue =
  | "slate"
  | "blue"
  | "green"
  | "amber"
  | "rose"
  | "violet"
  | "cyan"
  | "orange";

export const PROJECT_COLOR_OPTIONS: Array<{
  value: ProjectColorValue;
  brand: string;
  accent: string;
}> = [
  { value: "slate", brand: "#475569", accent: "#94a3b8" },
  { value: "blue", brand: "#2563eb", accent: "#60a5fa" },
  { value: "green", brand: "#16a34a", accent: "#4ade80" },
  { value: "amber", brand: "#d97706", accent: "#fbbf24" },
  { value: "rose", brand: "#e11d48", accent: "#fb7185" },
  { value: "violet", brand: "#7c3aed", accent: "#a78bfa" },
  { value: "cyan", brand: "#0891b2", accent: "#22d3ee" },
  { value: "orange", brand: "#ea580c", accent: "#fb923c" },
];

export function isProjectIconValue(value: string): value is ProjectIconValue {
  return PROJECT_ICON_OPTIONS.some((option) => option.value === value);
}

export function isProjectColorValue(value: string): value is ProjectColorValue {
  return PROJECT_COLOR_OPTIONS.some((option) => option.value === value);
}

export function readProjectIcons(): Record<string, ProjectIconValue> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROJECT_ICON_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isProjectIconValue(value)),
    ) as Record<string, ProjectIconValue>;
  } catch {
    return {};
  }
}

export function writeProjectIcons(value: Record<string, ProjectIconValue>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROJECT_ICON_STORAGE_KEY, JSON.stringify(value));
}

export function readProjectColors(): Record<string, ProjectColorValue> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROJECT_COLOR_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isProjectColorValue(value)),
    ) as Record<string, ProjectColorValue>;
  } catch {
    return {};
  }
}

export function writeProjectColors(value: Record<string, ProjectColorValue>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROJECT_COLOR_STORAGE_KEY, JSON.stringify(value));
}

type ProjectDetailsFieldsProps = {
  t: ReturnType<typeof useTranslations<"ProjectSwitcher">>;
  name: string;
  onNameChange: (value: string) => void;
  onNameKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  taskPrefix: string;
  onTaskPrefixChange: (value: string) => void;
  onTaskPrefixKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  taskPrefixInvalid: boolean;
  taskPrefixDuplicate: boolean;
  taskPrefixDuplicateValue: string;
  taskPrefixPreviewSample: string;
  showTaskPrefixHint?: boolean;
  iconValue: ProjectIconValue;
  onIconChange: (value: ProjectIconValue) => void;
  colorValue: ProjectColorValue;
  onColorChange: (value: ProjectColorValue) => void;
};

export function ProjectDetailsFields({
  t,
  name,
  onNameChange,
  onNameKeyDown,
  taskPrefix,
  onTaskPrefixChange,
  onTaskPrefixKeyDown,
  taskPrefixInvalid,
  taskPrefixDuplicate,
  taskPrefixDuplicateValue,
  taskPrefixPreviewSample,
  showTaskPrefixHint = true,
  iconValue,
  onIconChange,
  colorValue,
  onColorChange,
}: ProjectDetailsFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{t("projectNameLabel")}</p>
        <Input value={name} onChange={(event) => onNameChange(event.target.value)} onKeyDown={onNameKeyDown} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{t("taskKeyPrefixLabel")}</p>
        <Input
          className="max-w-[140px] font-mono uppercase tracking-wider"
          value={taskPrefix}
          onChange={(event) =>
            onTaskPrefixChange(event.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5))
          }
          onKeyDown={onTaskPrefixKeyDown}
          spellCheck={false}
          autoCapitalize="characters"
          aria-invalid={taskPrefixInvalid || taskPrefixDuplicate}
        />
        <p className="text-xs text-muted-foreground">
          {t("taskKeyPrefixPreview", { sample: taskPrefixPreviewSample })}
        </p>
        {showTaskPrefixHint && taskPrefix.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("taskKeyPrefixHintEmpty")}</p>
        ) : null}
        {taskPrefixInvalid ? (
          <p className="text-xs text-destructive">{t("taskPrefixInvalidFormat")}</p>
        ) : null}
        {taskPrefixDuplicate ? (
          <p className="text-xs text-destructive">{t("taskPrefixDuplicate", { prefix: taskPrefixDuplicateValue })}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("projectIconLabel")}</p>
        <p className="text-xs text-muted-foreground">{t("projectIconHint")}</p>
        <div className="grid grid-cols-4 gap-2">
          {PROJECT_ICON_OPTIONS.map(({ value, icon: Icon }) => {
            const isActive = iconValue === value;
            return (
              <Button key={value} type="button" variant={isActive ? "default" : "outline"} className="h-11" onClick={() => onIconChange(value)}>
                <Icon className="size-4" />
              </Button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("projectColorLabel")}</p>
        <p className="text-xs text-muted-foreground">{t("projectColorHint")}</p>
        <div className="grid grid-cols-4 gap-2">
          {PROJECT_COLOR_OPTIONS.map((option) => {
            const isActive = colorValue === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={isActive ? "default" : "outline"}
                className="h-11"
                onClick={() => onColorChange(option.value)}
              >
                <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: option.brand }} />
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
