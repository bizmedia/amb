"use client";

import { PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@amb-app/ui/components/button";
import { Input } from "@amb-app/ui/components/input";
import type { ViewMode } from "../types";

type TasksToolbarProps = {
  viewMode: ViewMode;
  setAndStoreViewMode: (value: ViewMode) => void;
  searchInput: string;
  setSearchInput: (value: string) => void;
  listLabel: string;
  kanbanLabel: string;
  searchPlaceholder: string;
  createLabel: string;
  onCreateClick: () => void;
};

export function TasksToolbar({
  viewMode,
  setAndStoreViewMode,
  searchInput,
  setSearchInput,
  listLabel,
  kanbanLabel,
  searchPlaceholder,
  createLabel,
  onCreateClick,
}: TasksToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <div className="inline-flex shrink-0 rounded-lg border border-border/60 bg-card/80 p-0.5 shadow-sm backdrop-blur-sm">
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            className="h-8 px-3"
            onClick={() => setAndStoreViewMode("list")}
          >
            {listLabel}
          </Button>
          <Button
            size="sm"
            variant={viewMode === "kanban" ? "default" : "ghost"}
            className="h-8 px-3"
            onClick={() => setAndStoreViewMode("kanban")}
          >
            {kanbanLabel}
          </Button>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/50 bg-background/60 px-2 py-0.5 backdrop-blur-sm sm:max-w-xl lg:max-w-md xl:max-w-xl">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            className="h-8 border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            aria-label={searchPlaceholder}
          />
        </div>
      </div>
      <Button
        onClick={onCreateClick}
        className="h-9 w-full shrink-0 gap-2 sm:w-auto sm:min-w-[10rem]"
      >
        <PlusIcon className="size-4" />
        {createLabel}
      </Button>
    </div>
  );
}
