import React from "react";
import { ClaimBadge } from "./ClaimBadge";
import { ScopeWarning } from "./ScopeWarning";

export interface MessageClaim {
  claim: string;
  sourceIndex: number | null;
}

export interface MessageProps {
  role: "user" | "assistant";
  content: string;
  claims?: MessageClaim[];
  refusal?: {
    type: "out_of_scope" | "not_in_corpus";
    reason: string;
    searched?: string[];
  };
  isError?: boolean;
  onClaimClick?: (index: number) => void;
}

export function MessageBubble({
  role,
  content,
  claims,
  refusal,
  isError,
  onClaimClick,
}: MessageProps) {
  return (
    <div className={`message-row ${role}`}>
      <div className="message-bubble">
        <span className="message-avatar">{role === "user" ? "🧑" : "🤖"}</span>
        
        {isError ? (
          <div style={{ color: "var(--danger-color)" }}>{content}</div>
        ) : (
          <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
        )}

        {refusal && (
          <ScopeWarning
            type={refusal.type}
            reason={refusal.reason}
            searched={refusal.searched}
          />
        )}

        {claims && claims.length > 0 && (
          <div className="claims-container">
            <div className="claims-title">Claims</div>
            {claims.map((claim, idx) => (
              <div key={idx} className="claim-item">
                <span>• {claim.claim}</span>
                {claim.sourceIndex !== null && onClaimClick && (
                  <ClaimBadge
                    sourceIndex={claim.sourceIndex}
                    onClick={onClaimClick}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
