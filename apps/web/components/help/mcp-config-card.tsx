"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@amb-app/ui/components/button";

type McpConfigCardProps = {
  title: string;
  description: string;
  code: string;
};

export function McpConfigCard({ title, description, code }: McpConfigCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-background/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
          {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{code}</pre>
    </div>
  );
}
