import { ChatResponse } from "./schema";

export type ScopeResult =
  | { allowed: true }
  | { allowed: false; reason: string };

const OUT_OF_SCOPE_MESSAGE =
  "I can't provide calorie targets, weight recommendations, or medical advice. Please consult a registered dietitian or healthcare provider.";

const FORBIDDEN_PATTERNS = [
  /how many calories should i/i,
  /calorie target/i,
  /caloric intake to/i,
  /lose weight/i,
  /gain weight/i,
  /\bbmi\b/i,
  /how much should i weigh/i,
  /ideal weight/i,
  /healthy weight for/i,
  /overweight/i,
  /underweight/i,
  /diagnose/i,
  /prescribe/i,
  /medication for/i,
  /treatment for/i,
  /should i take/i,
  /cure for/i,
];

export function checkIncomingMessage(message: string): ScopeResult {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(message)) {
      return { allowed: false, reason: OUT_OF_SCOPE_MESSAGE };
    }
  }
  return { allowed: true };
}

export function checkModelResponse(response: ChatResponse): ScopeResult {
  const contentToScan = [
    response.answer,
    ...response.claims.map((c) => c.claim),
  ].join(" ");

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(contentToScan)) {
      return { allowed: false, reason: OUT_OF_SCOPE_MESSAGE };
    }
  }
  return { allowed: true };
}
