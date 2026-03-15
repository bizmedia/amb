import type { Agent } from "@/lib/types";

export type ParsedMention = {
  mention: string; // например: "dev"
  startIndex: number;
  endIndex: number;
};

/**
 * Извлекает все @mentions из текста
 * Паттерн: @(\w+) - @ и следующие за ним буквы/цифры/подчеркивания
 */
export function parseMentions(text: string): ParsedMention[] {
  const mentionPattern = /@(\w+)/g;
  const mentions: ParsedMention[] = [];
  let match: RegExpExecArray | null;

  while ((match = mentionPattern.exec(text)) !== null) {
    mentions.push({
      mention: match[1]!, // группа без @
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
}

/**
 * Находит агента по mention (ищет по externalId, role, или name)
 * Возвращает первое совпадение или null
 */
export function resolveAgentByMention(
  mention: string,
  agents: Agent[]
): Agent | null {
  const lowerMention = mention.toLowerCase();

  // Сначала ищем точное совпадение по role (externalId)
  const byRole = agents.find((a) => a.role.toLowerCase() === lowerMention);
  if (byRole) return byRole;

  // Затем по имени (частичное совпадение)
  const byName = agents.find((a) =>
    a.name.toLowerCase().includes(lowerMention)
  );
  if (byName) return byName;

  return null;
}

/**
 * Извлекает первый toAgentId из текста на основе @mentions
 * Возвращает ID агента или null
 */
export function extractToAgentId(text: string, agents: Agent[]): string | null {
  const mentions = parseMentions(text);
  if (mentions.length === 0) return null;

  const agent = resolveAgentByMention(mentions[0]!.mention, agents);
  return agent?.id ?? null;
}

/**
 * Фильтрует агентов по поисковому запросу
 * Ищет по role, name
 */
export function filterAgentsByQuery(agents: Agent[], query: string): Agent[] {
  if (!query) return agents;

  const lowerQuery = query.toLowerCase();
  return agents.filter(
    (agent) =>
      agent.role.toLowerCase().includes(lowerQuery) ||
      agent.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Определяет позицию курсора относительно @mention
 * Возвращает текущий вводимый mention или null
 */
export function getCurrentMentionAtCursor(
  text: string,
  cursorPosition: number
): { mention: string; startIndex: number } | null {
  // Ищем @ перед курсором
  const textBeforeCursor = text.slice(0, cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf("@");

  if (lastAtIndex === -1) return null;

  // Проверяем, что между @ и курсором нет пробелов
  const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
  if (/\s/.test(textAfterAt)) return null;

  // Проверяем, что @ в начале или после пробела
  if (lastAtIndex > 0 && !/\s/.test(text[lastAtIndex - 1]!)) return null;

  return {
    mention: textAfterAt,
    startIndex: lastAtIndex,
  };
}
