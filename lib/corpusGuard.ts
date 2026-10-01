import { RetrievedChunk } from "./retriever";

export type CorpusResult =
  | { covered: true; relevantChunks: RetrievedChunk[] }
  | { covered: false; reason: string; searched: string[] };

const NOT_IN_CORPUS_MESSAGE =
  "The dietary guidance documents I have access to don't cover this topic.";

const SIMILARITY_THRESHOLD = 0.72;
const BARELY_RELEVANT_TOP = 0.75;
const BARELY_RELEVANT_NEXT = 0.70;
const HIGH_SCORE_THRESHOLD = 0.78;

export function checkRetrievalRelevance(
  query: string,
  chunks: RetrievedChunk[]
): CorpusResult {
  const searched = Array.from(new Set(chunks.map((c) => c.documentTitle)));

  if (chunks.length === 0) {
    return { covered: false, reason: NOT_IN_CORPUS_MESSAGE, searched: [] };
  }

  // All chunks below threshold
  if (chunks.every((c) => c.similarity < SIMILARITY_THRESHOLD)) {
    return { covered: false, reason: NOT_IN_CORPUS_MESSAGE, searched };
  }

  const highScoringChunks = chunks.filter((c) => c.similarity > HIGH_SCORE_THRESHOLD);
  if (highScoringChunks.length >= 2) {
    return { covered: true, relevantChunks: chunks };
  }

  // Sort by similarity descending
  const sortedChunks = [...chunks].sort((a, b) => b.similarity - a.similarity);
  const topChunk = sortedChunks[0];
  const nextChunk = sortedChunks.length > 1 ? sortedChunks[1] : null;

  if (
    topChunk.similarity < BARELY_RELEVANT_TOP &&
    (!nextChunk || nextChunk.similarity < BARELY_RELEVANT_NEXT)
  ) {
    return { covered: false, reason: NOT_IN_CORPUS_MESSAGE, searched };
  }

  return { covered: true, relevantChunks: chunks };
}
