import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ChatResponseSchema, ChatResponse } from "./schema";
import { getSystemPrompt } from "./systemPrompt";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
});

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type RetrievedChunk = {
  documentTitle: string;
  publisher: string;
  year: number;
  sectionHeading: string;
  content: string;
  url?: string;
};

export async function getChatCompletion(
  messages: Message[],
  chunks?: RetrievedChunk[]
): Promise<ChatResponse> {
  let chunksText = "";
  if (chunks && chunks.length > 0) {
    chunksText = chunks
      .map(
        (c, i) => `--- Chunk ${i + 1} ---
Document: ${c.documentTitle}
Publisher: ${c.publisher}
Year: ${c.year}
Section: ${c.sectionHeading}
${c.url ? `URL: ${c.url}\n` : ""}
${c.content}`
      )
      .join("\n\n");
  }

  const systemMessage: Message = {
    role: "system",
    content: getSystemPrompt(chunksText),
  };

  const response = await openai.chat.completions.parse({
    model: "llama3-70b-8192",
    messages: [systemMessage, ...messages],
    response_format: zodResponseFormat(ChatResponseSchema, "chat_response"),
    temperature: 0,
  });

  const parsed = response.choices[0]?.message?.parsed;

  if (!parsed) {
    throw new Error("OpenAI failed to return parsed JSON");
  }

  // Parse through our local zod schema to ensure exact compliance and hard fail
  return ChatResponseSchema.parse(parsed);
}
