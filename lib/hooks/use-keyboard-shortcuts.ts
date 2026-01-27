"use client";

import { useEffect, useCallback } from "react";

type ShortcutHandler = () => void;

type Shortcuts = {
  // Navigation
  goToMessages?: ShortcutHandler;      // 1
  goToInbox?: ShortcutHandler;         // 2
  goToDlq?: ShortcutHandler;           // 3
  // Actions
  newThread?: ShortcutHandler;         // n
  refresh?: ShortcutHandler;           // r
  search?: ShortcutHandler;            // /
  // Selection
  selectPrevious?: ShortcutHandler;    // k or ↑
  selectNext?: ShortcutHandler;        // j or ↓
  // Message actions
  sendMessage?: ShortcutHandler;       // Cmd/Ctrl + Enter
  ackMessage?: ShortcutHandler;        // a
};

export function useKeyboardShortcuts(shortcuts: Shortcuts, enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Allow Cmd/Ctrl+Enter in inputs for sending
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        shortcuts.sendMessage?.();
        return;
      }

      // Ignore other shortcuts when typing
      if (isInput) return;

      // Prevent default for handled shortcuts
      const handleShortcut = (handler?: ShortcutHandler) => {
        if (handler) {
          event.preventDefault();
          handler();
        }
      };

      switch (event.key) {
        case "1":
          handleShortcut(shortcuts.goToMessages);
          break;
        case "2":
          handleShortcut(shortcuts.goToInbox);
          break;
        case "3":
          handleShortcut(shortcuts.goToDlq);
          break;
        case "n":
          handleShortcut(shortcuts.newThread);
          break;
        case "r":
          handleShortcut(shortcuts.refresh);
          break;
        case "/":
          handleShortcut(shortcuts.search);
          break;
        case "k":
        case "ArrowUp":
          handleShortcut(shortcuts.selectPrevious);
          break;
        case "j":
        case "ArrowDown":
          handleShortcut(shortcuts.selectNext);
          break;
        case "a":
          handleShortcut(shortcuts.ackMessage);
          break;
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}

// Keyboard shortcuts help data
export const KEYBOARD_SHORTCUTS = [
  { key: "1", description: "Messages tab" },
  { key: "2", description: "Inbox tab" },
  { key: "3", description: "DLQ tab" },
  { key: "n", description: "New thread" },
  { key: "r", description: "Refresh" },
  { key: "/", description: "Search" },
  { key: "j/↓", description: "Next item" },
  { key: "k/↑", description: "Previous item" },
  { key: "a", description: "Acknowledge message" },
  { key: "⌘+Enter", description: "Send message" },
];
