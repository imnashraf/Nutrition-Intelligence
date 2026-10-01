import React from "react";

interface ClaimBadgeProps {
  sourceIndex: number;
  onClick: (index: number) => void;
}

export function ClaimBadge({ sourceIndex, onClick }: ClaimBadgeProps) {
  return (
    <button
      className="claim-badge"
      onClick={() => onClick(sourceIndex)}
      aria-label={`Scroll to source ${sourceIndex}`}
      type="button"
    >
      [{sourceIndex}]
    </button>
  );
}
