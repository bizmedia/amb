"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarRangeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  from?: string;
  to?: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  /** e.g. accessible name for the filter control */
  ariaLabel?: string;
};

function parseYmd(value?: string): Date | undefined {
  if (!value) return undefined;
  const parts = value.split("-");
  if (parts.length !== 3) return undefined;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return undefined;
  return new Date(y, m - 1, d);
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const da = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function formatRangeLabel(from?: string, to?: string): string {
  const df = parseYmd(from);
  const dt = parseYmd(to);
  const a = df ? df.toLocaleDateString() : "";
  const b = dt ? dt.toLocaleDateString() : "";
  if (a && b) return `${a} — ${b}`;
  if (a) return `${a} — …`;
  if (b) return `… — ${b}`;
  return "";
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  placeholder: placeholderProp,
  triggerClassName,
  ariaLabel,
}: DateRangePickerProps) {
  const t = useTranslations("Ui");
  const placeholder = placeholderProp ?? t("pickDateRange");
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    const f = parseYmd(from);
    const end = parseYmd(to);
    if (!f && !end) return undefined;
    return { from: f, to: end };
  }, [from, to]);

  const defaultMonth = selected?.from ?? selected?.to ?? new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className={cn("w-full justify-start gap-2 font-normal", triggerClassName)}
        >
          <CalendarRangeIcon className="size-4 shrink-0 opacity-80" />
          {from || to ? (
            <span className="truncate">{formatRangeLabel(from, to)}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[calc(100vw-1.25rem)] p-0" align="start">
        <Calendar
          className="border-0 bg-transparent p-3 shadow-none"
          mode="range"
          defaultMonth={defaultMonth}
          selected={selected}
          onSelect={(range) => {
            if (!range?.from) {
              onFromChange("");
              onToChange("");
              return;
            }
            onFromChange(toYmd(range.from));
            onToChange(range.to ? toYmd(range.to) : "");
          }}
          numberOfMonths={1}
        />
        <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onFromChange("");
              onToChange("");
            }}
          >
            {t("clearDateRange")}
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            {t("applyDateRange")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
