import React from "react";

interface ScopeWarningProps {
  type: "out_of_scope" | "not_in_corpus";
  reason: string;
  searched?: string[];
}

export function ScopeWarning({ type, reason, searched }: ScopeWarningProps) {
  return (
    <div className={`scope-warning ${type}`}>
      <div className="warning-title">
        {type === "out_of_scope" ? "🚫 Out of Scope" : "🔍 Not Covered"}
      </div>
      <div>{reason}</div>
      {type === "not_in_corpus" && searched && searched.length > 0 && (
        <div className="searched-list">
          <p>Documents searched:</p>
          <ul>
            {searched.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
