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
import type { EpicListItem } from "@/lib/hooks/use-epics";

type EpicPickerProps = {
  value: string;
  onChange: (epicId: string) => void;
  epics: EpicListItem[];
  disabled?: boolean;
  noneLabel: string;
  searchPlaceholder: string;
  emptyLabel: string;
};

export function EpicPicker({
  value,
  onChange,
  epics,
  disabled,
  noneLabel,
  searchPlaceholder,
  emptyLabel,
}: EpicPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = epics.find((e) => e.id === value);

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
          <span className="truncate">{selected ? selected.title : noneLabel}</span>
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
              {epics.map((epic) => (
                <CommandItem
                  key={epic.id}
                  value={`${epic.title} ${epic.id}`}
                  onSelect={() => {
                    onChange(epic.id);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn("mr-2 size-4", value === epic.id ? "opacity-100" : "opacity-0")}
                  />
                  {epic.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
