"use client";

import { DayPicker } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

export type CalendarProps = DayPickerProps;

/** Shadcn-style calendar: {@link https://ui.shadcn.com/docs/components/calendar} */
export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn(
        "rdp-shadcn-theme rounded-md border border-border/60 bg-card p-3 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
