"use client";

import ReactMarkdown from "react-markdown";

type MarkdownContentProps = {
  content: string;
  className?: string;
  clamped?: boolean;
};

export function MarkdownContent({ content, className = "", clamped }: MarkdownContentProps) {
  if (!content) return null;
  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${clamped ? "line-clamp-3" : ""} ${className}`}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
