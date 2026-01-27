"use client";

import { JsonView, allExpanded } from "react-json-view-lite";

type Props = {
  data: unknown;
  className?: string;
};

const customStyles = {
  container: "json-container",
  basicChildStyle: "json-child",
  label: "json-label",
  nullValue: "json-null",
  undefinedValue: "json-undefined",
  stringValue: "json-string",
  booleanValue: "json-boolean",
  numberValue: "json-number",
  otherValue: "json-other",
  punctuation: "json-punctuation",
  collapseIcon: "json-collapse-icon",
  expandIcon: "json-expand-icon",
  collapsedContent: "json-collapsed",
} as const;

export function JsonViewer({ data, className }: Props) {
  try {
    let parsedData: unknown = data;

    if (typeof data === "string") {
      try {
        parsedData = JSON.parse(data);
      } catch {
        return (
          <pre className={`${className || ""} font-mono text-sm whitespace-pre-wrap break-words text-foreground`}>
            {data}
          </pre>
        );
      }
    }

    if (parsedData === null || parsedData === undefined) {
      return (
        <span className={`${className || ""} text-muted-foreground italic`}>
          {parsedData === null ? "null" : "undefined"}
        </span>
      );
    }

    return (
      <div className={`${className || ""} json-viewer-wrapper`}>
        <JsonView
          data={parsedData}
          shouldExpandNode={allExpanded}
          style={customStyles}
        />
      </div>
    );
  } catch {
    return (
      <pre className={`${className || ""} font-mono text-sm whitespace-pre-wrap break-words text-foreground bg-muted/30 p-2 rounded`}>
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }
}
