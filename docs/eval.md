# Nutrition Intelligence — Evaluation Framework

This document outlines the evaluation framework for the Nutrition Intelligence system. It defines how to measure and ensure the quality of the RAG pipeline across retrieval, guardrails, and LLM generation based on the implementation plan.

## 1. Evaluation Dimensions

### A. Guardrail Accuracy (Scope & Corpus Guards)
The guards (Phase 9) are the primary defense against harmful, out-of-scope, and hallucinatory answers.
- **True Positive Rate (TPR)**: Correctly declining calorie targets, medical advice, and out-of-corpus queries.
- **False Positive Rate (FPR)**: Incorrectly declining valid food safety or nutrition guidelines questions.
*Metrics*: Precision and Recall for `out_of_scope` and `not_in_corpus` refusal types.

### B. Retrieval Quality (Phase 8)
Evaluating whether the vector database and similarity search surface the correct context.
- **Recall@K (K=8)**: The percentage of queries where the *definitive answer chunk* is present in the top 8 retrieved chunks.
- **Cross-document Diversity**: Ensuring the per-document deduplication rule (max 2 per doc) successfully surfaces chunks from multiple sources for broad queries.
*Metrics*: Recall@8, Source Diversity Score.

### C. Generation & Citation Fidelity (Phases 3 & 7)
Evaluated based on the LLM's adherence to the strict system prompt and Zod schema.
- **Faithfulness (No Hallucinations)**: 100% of the facts stated in the `answer` must be traceable to the retrieved chunks.
- **Citation Accuracy**: 100% of factual claims must have a valid `source`. No "phantom citations" (invented sections/snippets) or "blended citations" (merging two sources into one claim).
- **Schema Adherence**: The response must parse flawlessly against `ChatResponseSchema` without generating `ZodError`s (HTTP 500).

## 2. Test Datasets

To run evaluations reliably, the system relies on three distinct datasets (extending `scripts/testQuestions.json`):

1. **Golden Q&A Set (In-Scope)**
   - ~30 questions guaranteed to have answers in the curated corpus (e.g., "How to store raw chicken?", "Vegetarian protein requirements").
   - *Target Outcome*: Successful answer with valid citations.
2. **Boundary Set (Out-of-Scope)**
   - ~20 questions asking for calorie plans, medical diagnoses, or BMI calculations.
   - *Target Outcome*: `{ declined: true, refusalType: "out_of_scope" }`
3. **Out-of-Corpus Set**
   - ~20 questions about restaurants, recipes, or general knowledge not in the dietary guidelines.
   - *Target Outcome*: `{ declined: true, refusalType: "not_in_corpus" }`

## 3. Automated Evaluation Pipeline

The `failureLog.ts` script (Phase 12) serves as the primary evaluation runner.

### Execution Flow:
1. **Load Test Sets**: Read the Golden, Boundary, and Out-of-Corpus question sets.
2. **Execute Queries**: Fire `POST /api/chat` for each question (instantiating a fresh `conversationId` to avoid context bleeding).
3. **Capture Telemetry**: Record response latency, refusal types, and citation counts.
4. **Auto-Grade**:
   - Compare actual refusal types against expected outcomes based on the dataset used.
   - Verify that non-declined responses contain a valid `claims` array.
5. **Generate Report**: Output results to `docs/failureReport.md` highlighting any regressions.

*Note: LLM generation faithfulness and citation blending still require human-in-the-loop spot-checking via the generated failure report.*

## 4. Acceptance Criteria (Go/No-Go Metrics)

Before promoting any changes (system prompt tweaks, retrieval parameters, or chunking strategy) to production (Phase 13), the following criteria must be met:

| Metric | Target | Corrective Action if Failed |
|---|---|---|
| **Scope Guard TPR** | 100% | Blocker. Tweak `scopeGuard.ts` regex or LLM boundary prompt. |
| **Corpus Guard TPR** | ≥ 95% | Blocker. Adjust similarity threshold (currently `0.72`). |
| **Schema Validation** | 100% | Blocker. Fix JSON formatting instructions in `systemPrompt.ts`. |
| **Retrieval Recall@8** | ≥ 90% | Adjust chunk size (100-800 tokens), overlap (50 tokens), or switch embedding model. |
| **Faithfulness / Citation** | ≥ 95% | Tweak LLM system prompt directives regarding source isolation. |
| **Average Latency** | < 8s | Optimize DB indices, lower `topK`, or reduce chunk sizes. |

## 5. Regression Testing

Every significant code change (especially to `lib/systemPrompt.ts`, `lib/retriever.ts`, or `scripts/ingest.ts`) **MUST** be accompanied by a run of the evaluation pipeline:

```bash
npx tsx scripts/failureLog.ts
```

The resulting `docs/failureReport.md` should be diffed against the previous run to ensure no regressions in failure categories (e.g., `unsupported_facts`, `phantom_sources`, `should_have_declined`).
