"use client";

import { useSortable } from "@dnd-kit/sortable";
import { IconGripVertical } from "@tabler/icons-react";

import { Button } from "@amb-app/ui/components/button";

type DragHandleProps = {
  id: number;
};

export function DragHandle({ id }: DragHandleProps) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <IconGripVertical className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}
