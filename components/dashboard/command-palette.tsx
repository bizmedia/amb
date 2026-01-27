"use client"

import { useEffect, useState, useCallback } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"
import {
  MessageSquareIcon,
  InboxIcon,
  AlertTriangleIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  KeyboardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  SendIcon,
} from "lucide-react"

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (tab: "messages" | "inbox" | "dlq") => void
  onNewThread: () => void
  onRefresh: () => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onNewThread,
  onRefresh,
}: CommandPaletteProps) {
  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Командная палитра">
      <CommandInput placeholder="Введите команду или поиск..." />
      <CommandList>
        <CommandEmpty>Команда не найдена.</CommandEmpty>

        <CommandGroup heading="Навигация">
          <CommandItem onSelect={() => runCommand(() => onNavigate("messages"))}>
            <MessageSquareIcon className="size-4" />
            <span>Сообщения</span>
            <CommandShortcut>1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate("inbox"))}>
            <InboxIcon className="size-4" />
            <span>Входящие</span>
            <CommandShortcut>2</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate("dlq"))}>
            <AlertTriangleIcon className="size-4" />
            <span>Очередь ошибок</span>
            <CommandShortcut>3</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Действия">
          <CommandItem onSelect={() => runCommand(onNewThread)}>
            <PlusIcon className="size-4" />
            <span>Новый тред</span>
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onRefresh)}>
            <RefreshCwIcon className="size-4" />
            <span>Обновить</span>
            <CommandShortcut>R</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {})}>
            <SearchIcon className="size-4" />
            <span>Поиск</span>
            <CommandShortcut>/</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Выбор элементов">
          <CommandItem disabled>
            <ArrowUpIcon className="size-4" />
            <span>Предыдущий элемент</span>
            <CommandShortcut>K / ↑</CommandShortcut>
          </CommandItem>
          <CommandItem disabled>
            <ArrowDownIcon className="size-4" />
            <span>Следующий элемент</span>
            <CommandShortcut>J / ↓</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Сообщения">
          <CommandItem disabled>
            <CheckIcon className="size-4" />
            <span>Подтвердить сообщение</span>
            <CommandShortcut>A</CommandShortcut>
          </CommandItem>
          <CommandItem disabled>
            <SendIcon className="size-4" />
            <span>Отправить сообщение</span>
            <CommandShortcut>⌘ Enter</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

// Hook для открытия command palette через ⌘K
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // ⌘K или Ctrl+K для открытия
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      // ? для показа shortcuts
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement
        const isInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        if (!isInput) {
          e.preventDefault()
          setOpen(true)
        }
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return { open, setOpen }
}
