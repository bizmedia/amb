import type { Message } from "@/lib/types";

export type MessageSegment =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language: string | null };

export function parseMessageSegments(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  const codeFenceRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = codeFenceRegex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = codeFenceRegex.lastIndex;

    if (matchStart > lastIndex) {
      const plainText = text.slice(lastIndex, matchStart);
      if (plainText.trim()) {
        segments.push({ type: "text", content: plainText.trim() });
      }
    }

    const language = match[1] ?? null;
    const code = (match[2] ?? "").trim();
    if (code) {
      segments.push({ type: "code", content: code, language });
    }

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    const tailText = text.slice(lastIndex);
    if (tailText.trim()) {
      segments.push({ type: "text", content: tailText.trim() });
    }
  }

  if (segments.length === 0 && text.trim()) {
    segments.push({ type: "text", content: text.trim() });
  }

  return segments;
}

export function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentGroup: { date: string; messages: Message[] } | null = null;

  for (const msg of messages) {
    const date = new Date(msg.createdAt).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!currentGroup || currentGroup.date !== date) {
      currentGroup = { date, messages: [] };
      groups.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  }

  return groups;
}
