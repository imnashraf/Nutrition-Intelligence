"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatWindow } from "@/components/ChatWindow";
import { SourcesPanel } from "@/components/SourcesPanel";
import { Source, Claim } from "@/lib/schema";
import { MessageProps } from "@/components/MessageBubble";

type SourceWithIndex = { source: Source; index: number };
type ExtendedMessage = MessageProps & { id: string };

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [sources, setSources] = useState<SourceWithIndex[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);

  const handleSendMessage = async (messageText: string) => {
    // Add user message to UI immediately
    const userMsg: ExtendedMessage = {
      id: uuidv4(),
      role: "user",
      content: messageText,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: messageText,
        }),
      });

      let data: any = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data?.error || `API Error: ${res.status} ${res.statusText}`);
      }

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.declined) {
        const botMsg: ExtendedMessage = {
          id: uuidv4(),
          role: "assistant",
          content: "I cannot fulfill this request.",
          refusal: {
            type: data.refusalType,
            reason: data.reason,
            searched: data.searched,
          },
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (data.response) {
        // Parse claims and map new sources
        const newSources = [...sources];
        
        const mappedClaims = data.response.claims.map((claim: Claim) => {
          if (!claim.source) return { claim: claim.claim, sourceIndex: null };
          
          // Check if source already exists
          let existingIdx = newSources.findIndex(
            (s) => s.source.snippet === claim.source?.snippet && s.source.documentTitle === claim.source?.documentTitle
          );
          
          if (existingIdx === -1) {
            existingIdx = newSources.length + 1;
            newSources.push({ source: claim.source, index: existingIdx });
          } else {
            // Because our index is 1-based, increment existingIdx for the display
            existingIdx = newSources[existingIdx].index;
          }
          
          return { claim: claim.claim, sourceIndex: existingIdx };
        });

        setSources(newSources);

        const botMsg: ExtendedMessage = {
          id: uuidv4(),
          role: "assistant",
          content: data.response.answer,
          claims: mappedClaims,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: "Sorry, an error occurred while generating the response: " + err.message,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimClick = (index: number) => {
    setHighlightedSource(index);
    const element = document.getElementById(`source-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus();
    }
    
    // Remove highlight after a delay
    setTimeout(() => {
      setHighlightedSource(null);
    }, 2000);
  };

  return (
    <div className="layout-container">
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onClaimClick={handleClaimClick}
      />
      <SourcesPanel
        sources={sources}
        highlightedIndex={highlightedSource}
      />
    </div>
  );
}
