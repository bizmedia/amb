"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BotIcon } from "lucide-react";
import { getCurrentMentionAtCursor, filterAgentsByQuery } from "@/lib/mentions";
import type { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  agents: Agent[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function MentionInput({
  value,
  onChange,
  onKeyDown,
  agents,
  placeholder,
  disabled,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ left: 0 });
  const [currentMention, setCurrentMention] = useState<{
    mention: string;
    startIndex: number;
  } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredAgents = currentMention
    ? filterAgentsByQuery(agents, currentMention.mention)
    : agents;

  // Отслеживаем позицию курсора и показываем popup
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart ?? newValue.length;

      onChange(newValue);

      const mention = getCurrentMentionAtCursor(newValue, cursorPos);
      setCurrentMention(mention);
      setShowPopup(!!mention);
      setSelectedIndex(0);

      // Вычисляем позицию popup
      if (mention && inputRef.current) {
        // Примерная позиция на основе индекса символа
        const charWidth = 8; // приблизительная ширина символа
        setPopupPosition({ left: Math.min(mention.startIndex * charWidth, 200) });
      }
    },
    [onChange]
  );

  // Обработка выбора агента из popup
  const handleSelectAgent = useCallback(
    (agent: Agent) => {
      if (!currentMention) return;

      // Заменяем текущий @mention на @role
      const before = value.slice(0, currentMention.startIndex);
      const cursorPos = inputRef.current?.selectionStart ?? value.length;
      const after = value.slice(cursorPos);

      const newValue = `${before}@${agent.role} ${after}`;
      onChange(newValue);
      setShowPopup(false);
      setCurrentMention(null);

      // Фокус обратно на input
      setTimeout(() => {
        inputRef.current?.focus();
        const newCursorPos = before.length + agent.role.length + 2; // +2 для @ и пробела
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [currentMention, value, onChange]
  );

  // Обработка клавиатуры для навигации в popup
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showPopup && filteredAgents.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % filteredAgents.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((i) =>
            i === 0 ? filteredAgents.length - 1 : i - 1
          );
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          if (filteredAgents[selectedIndex]) {
            e.preventDefault();
            handleSelectAgent(filteredAgents[selectedIndex]);
            return;
          }
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowPopup(false);
          return;
        }
      }

      // Передаем событие дальше только если не обработали
      onKeyDown?.(e);
    },
    [showPopup, filteredAgents, selectedIndex, handleSelectAgent, onKeyDown]
  );

  // Закрываем popup при клике вне
  useEffect(() => {
    const handleClickOutside = () => setShowPopup(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />

      {/* Mention Popup */}
      {showPopup && filteredAgents.length > 0 && (
        <div
          className="absolute bottom-full mb-2 z-50 w-64 rounded-md border bg-popover shadow-lg"
          style={{ left: popupPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandList>
              <CommandGroup heading="Агенты">
                {filteredAgents.map((agent, index) => (
                  <CommandItem
                    key={agent.id}
                    value={agent.role}
                    onSelect={() => handleSelectAgent(agent)}
                    className={cn(
                      "cursor-pointer",
                      index === selectedIndex && "bg-accent"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center size-6 rounded-full mr-2",
                        agent.status === "online"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <BotIcon className="size-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">@{agent.role}</span>
                      <span className="text-xs text-muted-foreground">
                        {agent.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {filteredAgents.length === 0 && (
                <CommandEmpty>Агенты не найдены</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
