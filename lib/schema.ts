import { z } from "zod";

export const SourceSchema = z.object({
  documentTitle: z.string().describe("Title of the source document"),
  publisher: z.string().describe("Publishing authority"),
  year: z.number().describe("Publication year"),
  url: z.string().describe("Source URL"),
  sectionHeading: z.string().describe("Section within the document"),
  snippet: z.string().describe("Relevant excerpt from the chunk"),
});

export const ClaimSchema = z.object({
  claim: z.string().describe("A single factual claim made in the answer"),
  source: SourceSchema.describe("Citation source"),
});

export const ChatResponseSchema = z.object({
  answer: z.string().describe("The full answer text"),
  claims: z.array(ClaimSchema).describe("List of claims with per-claim citations"),
});

export const RefusalSchema = z.object({
  declined: z.literal(true),
  refusalType: z.enum(["out_of_scope", "not_in_corpus"]),
  reason: z.string(),
  searched: z.array(z.string()).optional()
    .describe("Document names searched — present only for not_in_corpus refusals"),
});

export type Source = z.infer<typeof SourceSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type Refusal = z.infer<typeof RefusalSchema>;
