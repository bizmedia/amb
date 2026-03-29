"use client";

import { Loader2Icon, PlusIcon } from "lucide-react";
import { Button } from "@amb-app/ui/components/button";
import { Input } from "@amb-app/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@amb-app/ui/components/dialog";

type ThreadCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  setTitle: (value: string) => void;
  creating: boolean;
  onCreate: () => void;
  labels: {
    createNewThread: string;
    createThreadDesc: string;
    threadTitlePlaceholder: string;
    cancel: string;
    creating: string;
    createThread: string;
  };
};

export function ThreadCreateDialog({
  open,
  onOpenChange,
  title,
  setTitle,
  creating,
  onCreate,
  labels,
}: ThreadCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="size-7">
          <PlusIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{labels.createNewThread}</DialogTitle>
          <DialogDescription>{labels.createThreadDesc}</DialogDescription>
        </DialogHeader>
        <Input
          placeholder={labels.threadTitlePlaceholder}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onCreate()}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {labels.cancel}
          </Button>
          <Button onClick={onCreate} disabled={!title.trim() || creating}>
            {creating ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                {labels.creating}
              </>
            ) : (
              labels.createThread
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
