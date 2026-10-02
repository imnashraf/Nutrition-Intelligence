import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { ChatRequest } from "@/lib/types";
import { checkIncomingMessage, checkModelResponse } from "@/lib/scopeGuard";
import { retrieveChunks } from "@/lib/retriever";
import { checkRetrievalRelevance } from "@/lib/corpusGuard";
import { getChatCompletion, Message } from "@/lib/openai";
import { createConversation, saveMessage, getMessages } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();
    let conversationId = body.conversationId;
    const userMessage = body.message;

    if (!conversationId) {
      conversationId = uuidv4();
      await createConversation(conversationId);
    }

    // Pre-check scope guard
    const preCheck = checkIncomingMessage(userMessage);
    if (!preCheck.allowed) {
      return NextResponse.json({
        conversationId,
        declined: true,
        refusalType: "out_of_scope",
        reason: preCheck.reason,
      });
    }

    // Save user message to DB
    await saveMessage(conversationId, "user", userMessage);

    // Retrieve chunks (includes embedding generation)
    const chunks = await retrieveChunks(userMessage);

    // Corpus guard check
    const corpusCheck = checkRetrievalRelevance(userMessage, chunks);
    if (!corpusCheck.covered) {
      return NextResponse.json({
        conversationId,
        declined: true,
        refusalType: "not_in_corpus",
        reason: corpusCheck.reason,
        searched: corpusCheck.searched,
      });
    }

    // Build message history
    const historyRows = await getMessages(conversationId);
    const messages: Message[] = historyRows.map((r: any) => ({
      role: r.role as "system" | "user" | "assistant",
      content: r.content,
    }));

    // Generate response using LLM
    const response = await getChatCompletion(messages, corpusCheck.relevantChunks);

    // Post-check scope guard
    const postCheck = checkModelResponse(response);
    if (!postCheck.allowed) {
      return NextResponse.json({
        conversationId,
        declined: true,
        refusalType: "out_of_scope",
        reason: postCheck.reason,
      });
    }

    // Save assistant message to DB
    await saveMessage(
      conversationId,
      "assistant",
      response.answer,
      JSON.stringify(response.claims)
    );

    // Return the successful response
    return NextResponse.json({
      conversationId,
      response,
    });
  } catch (error: any) {
    console.error("API /chat error:", error);
    return NextResponse.json(
  {
    error: "Failed to generate response",
    details: error.message,
  },
  { status: 500 }
);
}
}
