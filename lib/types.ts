import { ChatResponse, Refusal } from "./schema";

export type ChatRequest = {
  conversationId: string | null;
  message: string;
};

export type ChatAPIResponse = {
  conversationId: string;
  response: ChatResponse;
};

export type DeclinedResponse = {
  conversationId: string;
} & Refusal;

export type APIResponse = ChatAPIResponse | DeclinedResponse;
