import React, { FormEvent, useRef, useEffect } from "react";
import { MessageBubble, MessageProps } from "./MessageBubble";

interface ChatWindowProps {
  messages: (MessageProps & { id: string })[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClaimClick: (index: number) => void;
}

export function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  onClaimClick,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = React.useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>
          <span>🍏</span> Nutrition Intelligence
        </h1>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            claims={msg.claims}
            refusal={msg.refusal}
            isError={msg.isError}
            onClaimClick={onClaimClick}
          />
        ))}
        {isLoading && (
          <div className="message-row assistant">
            <div className="message-bubble" style={{ minWidth: "80px" }}>
              <span className="message-avatar">🤖</span>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="chat-input-wrapper">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about nutrition, food safety, or cooking..."
            disabled={isLoading}
          />
          <button type="submit" className="chat-submit" disabled={!inputValue.trim() || isLoading}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
