import React from "react";
import { Source } from "@/lib/schema";

interface SourceCardProps {
  source: Source;
  index: number;
  isHighlighted: boolean;
}

export function SourceCard({ source, index, isHighlighted }: SourceCardProps) {
  return (
    <div
      id={`source-${index}`}
      className={`source-card ${isHighlighted ? "highlight" : ""}`}
      tabIndex={0}
      aria-label={`Source ${index}: ${source.documentTitle}`}
    >
      <div className="source-card-header">
        <span className="source-title">{source.documentTitle}</span>
        <span className="source-id">[{index}]</span>
      </div>
      <div className="source-meta">
        {source.publisher}, {source.year} &mdash; {source.sectionHeading}
      </div>
      <div className="source-snippet">&quot;{source.snippet}&quot;</div>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="source-link"
        aria-label={`View full document for ${source.documentTitle}`}
      >
        View Source ↗
      </a>
    </div>
  );
}
