import { ChatResponseSchema, RefusalSchema } from '../lib/schema';
import { ZodError } from 'zod';

console.log('🧪 Starting schema tests...');

// 1. Valid ChatResponse with citations
const validResponse = {
  answer: "According to the guidelines, here is the answer.",
  claims: [
    {
      claim: "This is a fact.",
      source: {
        documentTitle: "Guidelines 2020",
        publisher: "Health Org",
        year: 2020,
        url: "https://example.com/guidelines",
        sectionHeading: "Introduction",
        snippet: "This is a fact stated in the introduction."
      }
    }
  ]
};

try {
  const parsed = ChatResponseSchema.parse(validResponse);
  console.log('✅ Valid ChatResponse with source passed');
} catch (error) {
  console.error('❌ Valid ChatResponse with source failed', error);
}

// 2. Valid ChatResponse with source: null
const validResponseNullSource = {
  answer: "Here is a general statement.",
  claims: [
    {
      claim: "General knowledge fact.",
      source: null
    }
  ]
};

try {
  const parsed = ChatResponseSchema.parse(validResponseNullSource);
  console.log('✅ Valid ChatResponse with source: null passed');
} catch (error) {
  console.error('❌ Valid ChatResponse with source: null failed', error);
}

// 3. Invalid ChatResponse (missing claims)
const invalidResponseMissingClaims = {
  answer: "This is an answer without claims array."
};

try {
  ChatResponseSchema.parse(invalidResponseMissingClaims);
  console.error('❌ Invalid ChatResponse (missing claims) incorrectly passed');
} catch (error) {
  if (error instanceof ZodError) {
    console.log('✅ Invalid ChatResponse (missing claims) threw ZodError as expected');
  } else {
    console.error('❌ Invalid ChatResponse (missing claims) threw wrong error', error);
  }
}

// 4. Invalid ChatResponse (wrong source shape)
const invalidResponseWrongSource = {
  answer: "Answer text",
  claims: [
    {
      claim: "Fact",
      source: {
        documentTitle: "Doc",
        publisher: "Pub",
        // missing year, url, sectionHeading, snippet
      }
    }
  ]
};

try {
  ChatResponseSchema.parse(invalidResponseWrongSource);
  console.error('❌ Invalid ChatResponse (wrong source shape) incorrectly passed');
} catch (error) {
  if (error instanceof ZodError) {
    console.log('✅ Invalid ChatResponse (wrong source shape) threw ZodError as expected');
  } else {
    console.error('❌ Invalid ChatResponse (wrong source shape) threw wrong error', error);
  }
}

// 5. Valid Refusal - out of scope
const validRefusalOutOfScope = {
  declined: true,
  refusalType: "out_of_scope",
  reason: "Cannot answer this."
};

try {
  RefusalSchema.parse(validRefusalOutOfScope);
  console.log('✅ Valid Refusal (out_of_scope) passed');
} catch (error) {
  console.error('❌ Valid Refusal (out_of_scope) failed', error);
}

// 6. Valid Refusal - not in corpus
const validRefusalNotInCorpus = {
  declined: true,
  refusalType: "not_in_corpus",
  reason: "Topic not covered.",
  searched: ["Doc 1", "Doc 2"]
};

try {
  RefusalSchema.parse(validRefusalNotInCorpus);
  console.log('✅ Valid Refusal (not_in_corpus) passed');
} catch (error) {
  console.error('❌ Valid Refusal (not_in_corpus) failed', error);
}

console.log('🎉 Schema tests finished!');
