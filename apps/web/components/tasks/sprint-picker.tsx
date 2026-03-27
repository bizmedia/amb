"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SprintListItem } from "@/lib/hooks/use-sprints";

type SprintPickerProps = {
  value: string;
  onChange: (sprintId: string) => void;
  sprints: SprintListItem[];
  disabled?: boolean;
  noneLabel: string;
  searchPlaceholder: string;
  emptyLabel: string;
};

/** Only PLANNED + ACTIVE (API may return COMPLETED when listing all). */
export function SprintPicker({
  value,
  onChange,
  sprints,
  disabled,
  noneLabel,
  searchPlaceholder,
  emptyLabel,
}: SprintPickerProps) {
  const [open, setOpen] = useState(false);
  const assignable = sprints.filter((s) => s.status !== "COMPLETED");
  const selected = assignable.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-9 w-full justify-between font-normal"
        >
          <span className="truncate">{selected ? selected.name : noneLabel}</span>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <CheckIcon className={cn("mr-2 size-4", !value ? "opacity-100" : "opacity-0")} />
                {noneLabel}
              </CommandItem>
              {assignable.map((sprint) => (
                <CommandItem
                  key={sprint.id}
                  value={`${sprint.name} ${sprint.id}`}
                  onSelect={() => {
                    onChange(sprint.id);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn("mr-2 size-4", value === sprint.id ? "opacity-100" : "opacity-0")}
                  />
                  {sprint.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
