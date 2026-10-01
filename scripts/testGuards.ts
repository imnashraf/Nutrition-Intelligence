import { checkIncomingMessage, checkModelResponse } from '../lib/scopeGuard';
import { checkRetrievalRelevance } from '../lib/corpusGuard';
import { ChatResponse } from '../lib/schema';
import { RetrievedChunk } from '../lib/retriever';

async function runTests() {
  console.log("=== Testing Scope Guard (Incoming Message) ===");
  
  const badMessages = [
    "How many calories should I eat to lose weight?",
    "What is the ideal weight for a 5'10 male?",
    "Can you prescribe medication for my stomach pain?"
  ];
  
  for (const msg of badMessages) {
    const res = checkIncomingMessage(msg);
    console.log(`[BAD] "${msg}" -> allowed: ${res.allowed} ${!res.allowed ? `(Reason: ${res.reason})` : ''}`);
    if (res.allowed) throw new Error("Should have been blocked");
  }

  const goodMessages = [
    "How should I store raw chicken?",
    "What is the safe cooking temperature for pork?",
    "How long can I keep leftovers in the fridge?"
  ];
  
  for (const msg of goodMessages) {
    const res = checkIncomingMessage(msg);
    console.log(`[GOOD] "${msg}" -> allowed: ${res.allowed}`);
    if (!res.allowed) throw new Error("Should have been allowed");
  }

  console.log("\n=== Testing Scope Guard (Model Response) ===");
  
  const badResponse: ChatResponse = {
    answer: "You should aim for a calorie target of 1500 to lose weight.",
    claims: []
  };
  
  const resBadModel = checkModelResponse(badResponse);
  console.log(`[BAD RESPONSE] -> allowed: ${resBadModel.allowed} ${!resBadModel.allowed ? `(Reason: ${resBadModel.reason})` : ''}`);
  if (resBadModel.allowed) throw new Error("Should have been blocked");

  const goodResponse: ChatResponse = {
    answer: "Raw chicken should be stored at or below 40 degrees Fahrenheit.",
    claims: [
      { claim: "Store at 40 degrees", source: null }
    ]
  };
  
  const resGoodModel = checkModelResponse(goodResponse);
  console.log(`[GOOD RESPONSE] -> allowed: ${resGoodModel.allowed}`);
  if (!resGoodModel.allowed) throw new Error("Should have been allowed");

  console.log("\n=== Testing Corpus Guard ===");
  
  const mockChunks: RetrievedChunk[] = [
    {
      id: "1",
      documentId: "doc1",
      documentTitle: "Safe Food Handling Guide",
      publisher: "FDA",
      year: 2023,
      url: "https://fda.gov",
      sectionHeading: "Storage",
      content: "Keep raw poultry at 40F or below.",
      similarity: 0.82
    },
    {
      id: "2",
      documentId: "doc2",
      documentTitle: "Food Safety Tips",
      publisher: "USDA",
      year: 2022,
      url: "https://usda.gov",
      sectionHeading: "Cooling",
      content: "Refrigerate foods properly.",
      similarity: 0.79
    }
  ];

  const resCovered = checkRetrievalRelevance("How to store chicken?", mockChunks);
  console.log(`[COVERED] -> covered: ${resCovered.covered}`);
  if (!resCovered.covered) throw new Error("Should be covered");

  const mockBadChunks: RetrievedChunk[] = [
    {
      id: "3",
      documentId: "doc3",
      documentTitle: "General Guidelines",
      publisher: "WHO",
      year: 2020,
      url: "https://who.int",
      sectionHeading: "Misc",
      content: "Some general info.",
      similarity: 0.65
    }
  ];

  const resNotCovered = checkRetrievalRelevance("What's the best restaurant in London?", mockBadChunks);
  console.log(`[NOT COVERED] -> covered: ${resNotCovered.covered}`);
  if (resNotCovered.covered) throw new Error("Should NOT be covered");
  if (!resNotCovered.covered) {
    console.log(`  Reason: ${resNotCovered.reason}`);
    console.log(`  Searched: ${resNotCovered.searched.join(", ")}`);
  }
  
  const resEmptyChunks = checkRetrievalRelevance("What's the best restaurant in London?", []);
  console.log(`[EMPTY CHUNKS] -> covered: ${resEmptyChunks.covered}`);
  if (resEmptyChunks.covered) throw new Error("Should NOT be covered");
  
  console.log("\nAll tests passed!");
}

runTests().catch(console.error);
