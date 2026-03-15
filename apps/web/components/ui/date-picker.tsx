"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseValue(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function DatePicker({ value, onChange, placeholder: placeholderProp }: DatePickerProps) {
  const t = useTranslations("Ui");
  const placeholder = placeholderProp ?? t("selectDate");
  const [open, setOpen] = useState(false);
  const selectedDate = parseValue(value);
  const [viewDate, setViewDate] = useState<Date>(selectedDate ?? new Date());

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = [];
    for (let i = 0; i < startOffset; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [viewDate]);

  const selectedValue = selectedDate ? toDateInputValue(selectedDate) : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 font-normal">
          <CalendarIcon className="size-4" />
          {selectedDate ? selectedDate.toLocaleDateString() : <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Pick a date</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <p className="text-sm font-medium capitalize">{monthLabel(viewDate)}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
            <span>Su</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-8" />;
              }

              const dayValue = toDateInputValue(day);
              const isSelected = dayValue === selectedValue;

              return (
                <Button
                  key={dayValue}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "ghost"}
                  className="h-8 px-0"
                  onClick={() => {
                    onChange(dayValue);
                    setOpen(false);
                  }}
                >
                  {day.getDate()}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                onChange(toDateInputValue(today));
                setViewDate(today);
                setOpen(false);
              }}
            >
              Today
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
