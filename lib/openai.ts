import OpenAI from "openai";

import { ChatResponseSchema, ChatResponse } from "./schema";
import { getSystemPrompt } from "./systemPrompt";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
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

const NutritionResponseSchema = {
  type: "object",
  properties: {
    answer: {
      type: "string",
      description: "The full answer text"
    },
    claims: {
      type: "array",
      description: "List of claims with per-claim citations",
      items: {
        type: "object",
        properties: {
          claim: {
            type: "string",
            description: "A single factual claim made in the answer"
          },
          source: {
            type: ["object", "null"],
            description: "Citation source — null if uncitable",
            properties: {
              documentTitle: { type: "string", description: "Title of the source document" },
              publisher: { type: "string", description: "Publishing authority" },
              year: { type: "integer", description: "Publication year" },
              url: { type: "string", description: "Source URL" },
              sectionHeading: { type: "string", description: "Section within the document" },
              snippet: { type: "string", description: "Relevant excerpt from the chunk" }
            },
            required: ["documentTitle", "publisher", "year", "url", "sectionHeading", "snippet"],
            additionalProperties: false
          }
        },
        required: ["claim", "source"],
        additionalProperties: false
      }
    }
  },
  required: ["answer", "claims"],
  additionalProperties: false
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

  const response = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [systemMessage, ...messages],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "nutrition_response",
        strict: true,
        schema: NutritionResponseSchema
      }
    },
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI failed to return content");
  }

  const parsed = JSON.parse(content);
  return ChatResponseSchema.parse(parsed);
}
