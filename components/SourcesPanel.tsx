import React from "react";
import { Source } from "@/lib/schema";
import { SourceCard } from "./SourceCard";

interface SourcesPanelProps {
  sources: { source: Source; index: number }[];
  highlightedIndex: number | null;
}

export function SourcesPanel({ sources, highlightedIndex }: SourcesPanelProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="sources-panel">
      <div className="sources-header">
        <h2>References</h2>
      </div>
      <div className="sources-list">
        {sources.map((item) => (
          <SourceCard
            key={item.index}
            source={item.source}
            index={item.index}
            isHighlighted={highlightedIndex === item.index}
          />
        ))}
      </div>
    </div>
  );
}
