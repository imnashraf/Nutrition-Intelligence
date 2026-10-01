# Conventions — Nutrition Intelligence

> Coding standards, naming rules, and workflow conventions for every contributor.
> Derived from the [architecture](file:///Users/mna/Nutrition-Intelligence/architecture.md) and [implementation plan](file:///Users/mna/Nutrition-Intelligence/implementation-plan.md).

---

## 1. Language & Runtime

| Rule | Convention |
|------|-----------|
| Language | TypeScript — strict mode (`"strict": true` in `tsconfig.json`) |
| Runtime | Node.js 18+ |
| Module system | ES Modules (`"moduleResolution": "bundler"`) |
| No `any` | Prefer `unknown` + type narrowing. `any` requires a `// eslint-disable` comment with justification. |

---

## 2. File & Folder Naming

| Item | Convention | Example |
|------|-----------|---------|
| **Directories** | `camelCase` | `lib/`, `components/`, `db/migrations/` |
| **React components** | `PascalCase.tsx` | `ChatWindow.tsx`, `MessageBubble.tsx` |
| **Library modules** | `camelCase.ts` | `scopeGuard.ts`, `openai.ts`, `db.ts` |
| **API routes** | `route.ts` inside path-based folders | `app/api/chat/route.ts` |
| **SQL migrations** | `NNN_description.sql` (zero-padded) | `001_init.sql`, `002_documents.sql` |
| **Scripts** | `camelCase.ts` | `failureLog.ts`, `ingest.ts` |
| **Docs** | `camelCase.md` or `kebab-case.md` | `problemStatement.md`, `implementation-plan.md` |
| **JSON data files** | `camelCase.json` | `testQuestions.json`, `registry.json` |
| **CSS** | `globals.css` for global; `ComponentName.module.css` for scoped | `ChatWindow.module.css` |

---

## 3. Import Conventions

### Order (enforced top-to-bottom, separated by blank lines)

```typescript
// 1. Node built-ins
import path from "path";

// 2. External packages
import { z } from "zod";
import OpenAI from "openai";

// 3. Internal lib modules (absolute alias)
import { ChatResponseSchema } from "@/lib/schema";
import { checkIncomingMessage } from "@/lib/scopeGuard";

// 4. Components
import { ChatWindow } from "@/components/ChatWindow";

// 5. Types (type-only imports)
import type { ChatResponse, Claim } from "@/lib/schema";
```

### Rules

- Use the `@/` alias (mapped to project root) for all internal imports.
- Use `import type` for type-only imports — keeps runtime bundles clean.
- Never use relative paths that go up more than one level (`../../` is a code smell).

---

## 4. TypeScript Conventions

### Types & Interfaces

| Rule | Convention |
|------|-----------|
| Prefer `type` over `interface` | Unless you need declaration merging |
| Schema-derived types | Always infer from Zod: `type Claim = z.infer<typeof ClaimSchema>` |
| No manual duplication | If a type exists in `schema.ts`, import it — don't re-declare |
| Export from source file | Types live next to the code that defines them |

### Naming

| Item | Convention | Example |
|------|-----------|---------|
| Types / Interfaces | `PascalCase` | `ChatResponse`, `ScopeResult` |
| Zod schemas | `PascalCase` + `Schema` suffix | `ClaimSchema`, `ChatResponseSchema` |
| Functions | `camelCase`, verb-first | `getChatCompletion`, `checkIncomingMessage` |
| Constants | `UPPER_SNAKE_CASE` for true constants; `camelCase` for config objects | `MAX_RETRIES`, `systemPrompt` |
| Booleans | Prefix with `is`, `has`, `should`, `can` | `isAllowed`, `hasDeclined` |
| Event handlers | Prefix with `handle` (component) or `on` (prop) | `handleSubmit`, `onSend` |

### Null & Undefined

- Use `null` for intentional absence (e.g., `source: null` for uncitable claims).
- Use `undefined` only when a value hasn't been set yet (e.g., optional function params).
- Never mix the two for the same concept.

---

## 5. React / Next.js Conventions

### Component Structure

```typescript
// components/MessageBubble.tsx

// 1. Imports
import type { ChatResponse } from "@/lib/schema";
import styles from "./MessageBubble.module.css";

// 2. Types (component-specific, unexported)
type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  claims?: ChatResponse["claims"];
};

// 3. Component (named export, not default)
export function MessageBubble({ role, content, claims }: MessageBubbleProps) {
  // hooks first
  // derived state
  // handlers
  // render
  return ( /* ... */ );
}
```

### Rules

| Rule | Convention |
|------|-----------|
| Named exports | `export function ChatWindow()` — no `export default` |
| Client components | Add `"use client"` only when the component uses hooks, events, or browser APIs |
| Server components | Default. No directive needed. Prefer these whenever possible. |
| Props type | Inline `type`, not `interface`. Defined directly above the component. |
| State management | React `useState` + `useReducer`. No external state library required. |
| Data fetching | `fetch` from client components to `/api/chat`. No SWR/React Query needed for chat logic. |

### Component File Checklist

- [ ] Props type defined
- [ ] Accessible: semantic HTML, `aria-*` labels where needed, keyboard support
- [ ] No inline styles — use CSS modules or `globals.css`
- [ ] No hardcoded strings for user-facing text (extract to constants)

---

## 6. CSS Conventions

### Architecture

| Scope | File | When to use |
|-------|------|-------------|
| Global resets, tokens, layout | `app/globals.css` | CSS custom properties, body/html resets, layout grid |
| Component-scoped | `ComponentName.module.css` | Styles specific to one component |

### Naming (inside CSS Modules)

- Use `camelCase` for class names: `.messageContainer`, `.claimBadge`.
- CSS Modules auto-scope, so short descriptive names are fine.

### Design Tokens (CSS Custom Properties)

Define all shared values in `globals.css`:

```css
:root {
  /* Colors */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #1a1a2e;
  --color-text-primary: #e0e0e0;
  --color-text-secondary: #a0a0b0;
  --color-accent: #6366f1;
  --color-accent-hover: #818cf8;
  --color-user-bubble: #1e1e3a;
  --color-assistant-bubble: #16213e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-success: #10b981;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Borders */
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
}
```

### Rules

- Never use raw color values in component CSS — always use `var(--color-*)`.
- Never use raw pixel values for spacing — always use `var(--space-*)`.
- Responsive breakpoint: `768px` (mobile ↔ desktop).

---

## 7. API Route Conventions

### Structure

```typescript
// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse & validate request body
    // 2. Business logic (scope guard, retrieval, model call)
    // 3. Return success response
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // 4. Error handling (see below)
  }
}
```

### HTTP Status Codes

| Status | When |
|--------|------|
| `200` | Successful response (including declines — they're valid responses) |
| `400` | Malformed request body (missing `message`, invalid JSON) |
| `500` | Schema validation failure, OpenAI error, Database write failure, or unexpected server error |
| `503` | Vector DB or external service unavailable |

### Error Response Shape

All errors follow a consistent shape:

```typescript
{ "error": string, "details"?: string }
```

### Rules

- No `GET` for the chat endpoint — it mutates state (creates messages).
- Always validate the request body before processing.
- Never expose raw error stack traces in production — log them server-side, return a clean message.

---

## 8. Database Conventions (Postgres)

| Rule | Convention |
|------|-----------|
| Table names | `snake_case`, plural | `conversations`, `messages`, `documents` |
| Column names | `snake_case` | `conversation_id`, `claims_json`, `created_at` |
| Primary keys | `id` — `TEXT` (UUID) for conversations, `SERIAL` or `TEXT` for others |
| Foreign keys | `<singular_table>_id` | `conversation_id`, `document_id` |
| Timestamps | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` — always UTC |
| JSON columns | Stored as `JSONB` or `TEXT`, suffixed with `_json` | `claims_json` |
| Indexes | `idx_<table>_<column>` | `idx_messages_conversation` |

### Migration Rules

- Migrations are numbered sequentially: `001_`, `002_`, `003_`.
- Each migration file is idempotent (`CREATE TABLE IF NOT EXISTS`).
- Never modify a migration that has been committed — create a new one.

---

## 9. Error Handling

### Hierarchy

```
1. Validate input       → 400 Bad Request
2. Scope guard check    → 200 with { declined: true, refusalType: "out_of_scope" }
3. Retrieval relevance  → 200 with { declined: true, refusalType: "not_in_corpus" }
4. OpenAI call          → 500 if API fails (with retry logic)
5. Schema validation    → 500 if response doesn't parse (HARD FAIL — intentional)
6. Database write       → 500 if persistence fails
```

### Rules

| Rule | Why |
|------|-----|
| Schema parse failures are `500`, not silent fallbacks | A broken contract must be visible. Silently patching hides bugs. |
| Declined questions are `200`, not `403` | The system worked correctly — it just chose not to answer. |
| Log errors server-side with `console.error` | Next.js captures these in Vercel logs. |
| Never swallow errors in a catch block | At minimum, log and re-throw or return an error response. |

---

## 10. Environment Variables

| Variable | Required | Where set | Notes |
|----------|----------|-----------|-------|
| `GROQ_API_KEY` | Yes | `.env.local` / Vercel dashboard | Groq LLM API key |
| `DATABASE_URL` | Yes | `.env.local` / Vercel dashboard | Postgres connection string |
| `PINECONE_API_KEY` | Yes | `.env.local` / Vercel dashboard | Vector DB access |
| `PINECONE_INDEX` | Yes | `.env.local` / Vercel dashboard | Vector DB index name |

### Rules

- Access via `process.env.VARIABLE_NAME` — only in server-side code (`lib/`, `app/api/`).
- Fail fast on startup if a required env var is missing.
- Never prefix with `NEXT_PUBLIC_` — API keys and database strings must never reach the browser.

---

## 11. Git Conventions

### Branch Naming

```
main                      # production branch
feature/<phase>-<name>    # feature branches
fix/<short-description>   # bug fixes
```

Examples: `feature/phase-2-database`, `feature/phase-11-chat-ui`, `fix/scope-guard-regex`.

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

| Type | When |
|------|------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes nor adds |
| `docs` | Documentation only |
| `style` | Formatting, CSS (no logic change) |
| `chore` | Build config, dependencies, tooling |
| `test` | Adding or updating tests/scripts |

**Scope** maps to project areas: `db`, `schema`, `api`, `ui`, `scope-guard`, `prompt`, `deploy`, `failure-log`, `ingest`.

Examples:
```
feat(schema): add Zod schemas for ChatResponse and Claim
feat(api): implement POST /api/chat with RAG retrieval
fix(scope-guard): catch "BMI" as weight-related keyword
docs(failure-log): update failure report against latest prompt
chore(deploy): configure Vercel environment variables
```

### .gitignore

```gitignore
node_modules/
.env.local
.next/
out/
```

---

## 12. Documentation Conventions

### Code Comments

| Type | When | Format |
|------|------|--------|
| **Why** comments | Non-obvious decisions | `// We hard-fail here because silent fallbacks hide schema drift` |
| **TODO** comments | Known future work | `// TODO: Optimize similarity search threshold based on analytics` |
| **JSDoc** | Exported functions | `/** Checks if an incoming message is within scope */` |
| No comment | Self-explanatory code | Don't comment `const name = user.name;` |

### JSDoc for Exported Functions

```typescript
/**
 * Validates the incoming user message against scope rules.
 * Returns a declined result if the message asks for calorie targets,
 * weight recommendations, or medical advice.
 */
export function checkIncomingMessage(message: string): ScopeResult {
  // ...
}
```

### Markdown Docs

- All docs live in the project root or `docs/` folder.
- Use ATX-style headings (`#`, `##`, `###`).
- Tables for structured comparisons.
- Code blocks with language tags for syntax highlighting.

---

## 13. Testing & Validation

### Schema Validation

- Every model response **must** pass through `ChatResponseSchema.parse()`.
- Parse failures throw `ZodError` — never caught silently.
- No fallback schemas. No "best-effort" parsing.

### Prompt Regression Testing

After **every** change to `systemPrompt.ts` or the retriever logic:

```bash
npx tsx scripts/failureLog.ts
```

Compare the new `docs/failureReport.md` with the previous committed version. If new failures appear, document them — do **not** hardcode fixes.

### Manual Smoke Tests

Run before every deployment:

| Test | Expected result |
|------|----------------|
| Send a food question | Response with answer + claims, and citations populated in sources panel |
| Send an off-topic question | Declined response (`not_in_corpus`) listing documents searched |
| Send a calorie/weight question | Declined response (`out_of_scope`) with redirect message |
| Send two messages in same conversation | Context is maintained |
| Open on mobile viewport | Sources panel stacks below chat |
| Check browser Network tab | No `GROQ_API_KEY` in any request |

---

## 14. Dependency Management

### Rules

- Pin exact versions in `package.json` (use `npm install --save-exact`).
- Document why each dependency exists:

| Package | Purpose |
|---------|---------|
| `next` | Framework (frontend + API routes) |
| `react` / `react-dom` | UI rendering |
| `zod` | Schema validation (structured output parsing) |
| `openai` | OpenAI SDK (used as Groq client) |
| `pg` | Postgres driver for database operations |
| `@pinecone-database/pinecone` | Vector database client |
| `pdf-parse` | Text extraction for ingestion pipeline |
| `uuid` | Conversation ID generation |
| `tsx` | Run TypeScript scripts directly (failure log, ingestion) |

### No Unnecessary Dependencies

Do **not** install:
- State management (Redux, Zustand) — `useState` is sufficient.
- Data fetching libraries (SWR, React Query) — plain `fetch` is sufficient.
- CSS frameworks (Tailwind, Chakra) — vanilla CSS + CSS Modules.
- Testing frameworks — manual testing + failure log script.
- Linters beyond default Next.js ESLint.

---

## 15. Security Conventions

| Rule | Enforcement |
|------|-------------|
| API keys are server-side only | Never use `NEXT_PUBLIC_` prefix for secrets |
| No secrets in git | `.env.local` in `.gitignore`; keys set in Vercel dashboard |
| Input sanitization | Validate request body shape before processing |
| No raw SQL interpolation | Use parameterized queries via `pg` |
| Rate limiting | Optional, apply to API routes via Vercel Edge if needed |

### Parameterized Queries

```typescript
// ✅ Correct
await db.query(
  "INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)", 
  [id, role, content]
);

// ❌ Never do this
await db.query(`INSERT INTO messages (conversation_id, role, content) VALUES ('${id}', '${role}', '${content}')`);
```
