# Problem Statement — Nutrition Intelligence

---

## Project Vision

Build a chatbot that answers questions about food, nutrition, and food safety — grounded entirely in official public dietary guidance documents. Every factual claim carries a citation. When the guidance doesn't cover a question, the assistant says so. When a question crosses into medical territory, it declines and redirects.

In the final product, this becomes the service that answers *"is this a reasonable way to eat"* and *"how long can I keep this in the fridge"* — backed by the same guidance that health authorities publish but almost nobody reads.

---

## The Problem

Ask a model how much protein a vegetarian adult needs. The answer arrives in 2 seconds, sounds specific, and comes from nobody.

Ask again tomorrow and the number has moved. Ask what a health authority recommends and it will happily tell you, whether or not that authority ever said it.

Food is a bad place for this to happen. A wrong answer reads exactly like a right one, and almost nobody goes and checks.

The real guidance exists. Health authorities publish long, careful, boring PDFs on exactly this. No API, just written prose, and almost nobody reads them. That gap is what RAG is for.

> [!NOTE]
> Nutrient numbers for individual foods (calories in a banana, iron in spinach) are different data and don't belong here. Those come from a structured database in Milestone 3.

---

## What You Build

### 1. Chat Frontend

A message list, an input box, and a sources panel next to the conversation.

The sources panel displays citation cards for each claim's source document — showing the document title, publisher, year, relevant section, a snippet of the source text, and a link to the original. Claim badges in the chat are clickable and scroll to their corresponding source card.

### 2. Backend

A chat endpoint, somewhere to store the conversation, and the model call.

Keep the model call on your server, not in the browser. The user should never see an API key in the network tab.

### 3. Corpus

Gather 20 to 25 public guidance documents from recognised authorities. National nutrition institutes, food safety regulators, and international health bodies all work. Written prose only — anything with a clean structured API behind it doesn't belong here (that's Milestone 3).

Store publisher, year, source URL, and retrieval date with every document.

**Target Corpus (Public URLs):**
1. [Dietary Guidelines for Americans 2020-2025 (USDA/HHS)](https://www.dietaryguidelines.gov/sites/default/files/2020-12/Dietary_Guidelines_for_Americans_2020-2025.pdf)
2. [WHO Five Keys to Safer Food Manual](https://iris.who.int/handle/10665/43546)
3. [FDA Safe Food Handling Guide](https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling)
4. [The Eatwell Guide (Public Health England)](https://www.gov.uk/government/publications/the-eatwell-guide)
5. [Australian Dietary Guidelines (NHMRC)](https://www.eatforhealth.gov.au/guidelines)
6. [Canada's Food Guide (Health Canada)](https://food-guide.canada.ca/en/)
7. [EFSA Dietary Reference Values (EU)](https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values)
8. [WHO Healthy Diet Fact Sheet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet)
9. [CDC Food Safety Resources](https://www.cdc.gov/foodsafety/)
10. [USDA Safe Minimum Internal Temperature Chart](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart)
11. [New Zealand Eating and Activity Guidelines](https://www.health.govt.nz/publication/eating-and-activity-guidelines-new-zealand-adults)
12. [FAO Food-Based Dietary Guidelines Database](https://www.fao.org/nutrition/education/food-dietary-guidelines/en/)
13. [U.S. FoodSafety.gov - Cold Food Storage Chart](https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts)
14. [Irish Food Safety Authority - Safe Food To Go](https://www.fsai.ie/publications/safe-food-to-go)
15. [Japan Food Guide Spinning Top (MHLW)](https://www.mhlw.go.jp/bunya/kenkou/pdf/eiyou-syokuji5.pdf)
16. [Dietary Guidelines for Indians (NIN)](https://www.nin.res.in/downloads/DietaryGuidelinesforNINwebsite.pdf)
17. [Dietary Guidelines for the Brazilian Population](https://bvsms.saude.gov.br/bvs/publicacoes/dietary_guidelines_brazilian_population.pdf)
18. [Nordic Nutrition Recommendations (NNR)](https://pub.norden.org/nord2023-003/)
19. [Singapore Health Promotion Board - My Healthy Plate](https://www.healthhub.sg/programmes/55/my-healthy-plate)
20. [USDA FSIS - Leftovers and Food Safety](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety)
21. [FDA - Food Safety in Your Kitchen](https://www.fda.gov/food/buy-store-serve-safe-food/food-safety-your-kitchen)
22. [WHO - Safe preparation, storage and handling of powdered infant formula](https://www.who.int/publications/i/item/9789241595414)

### 4. Chunking

Every chunk carries the document name, publisher, year, and section heading. These documents are full of tables and numbered recommendations that fixed-size chunking will cut in half. Say in the README what you chose and what it cost you.

### 5. Retrieval

A vector index over the chunks, supporting retrieval across all documents and retrieval filtered to one named document.

### 6. Response Schema

The model returns structured output, not prose.

The response should contain:

- **Answer text**
- **A list of claims**
  - Each claim should contain:
    - Claim text
    - Source field — a citation showing document name, publisher, year, section, snippet, and a link

Parse against the schema and fail when it doesn't parse. No silent fallbacks.

### 7. Answer Layer

The assistant answers only from retrieved chunks. Every claim carries a citation showing document name, publisher, year, and a link.

When multiple documents address the same question — like cooking oil, where a nutrition institute talks about fatty acid degradation and a food safety regulator talks about bacterial contamination — answer per document, with separate citations. Never blend two sources into one claim about what "the guidelines say".

### 8. System Prompt

Write:

- What the assistant does
- How it answers
- How long its answers should be
- What it won't touch
- That it must answer ONLY from retrieved context chunks
- That every claim must cite its source
- That it should present each document's perspective separately when multiple sources are relevant
- That it should say what the chunks cover and what they don't — never extrapolate

Keep a fixed set of questions and re-run all of them after every prompt change.

Fixing one case while quietly breaking three others is the usual way this goes wrong.

### 9. Two Kinds of Refusal

You need both. They are different problems with different solutions.

- **Not in the corpus:** When the retrieved chunks don't hold the answer, the assistant says the guidance doesn't cover it and names what it searched. This is a retrieval problem — the model tried to find an answer but the documents don't have one.

- **Out of scope by design:** No medical advice, no calorie or weight targets, nothing about what anyone should weigh. It declines and points the person to a qualified professional. This is a policy boundary — the model shouldn't even try.

### 10. Scope Limits, Enforced in Code

The assistant should **not** provide:

- Calorie or weight targets
- Recommendations about what anyone should weigh
- Medical advice

It should decline these questions and point the person to a qualified professional.

A line in the prompt won't hold on its own, so put the check in code as well. Both a pre-check (before calling the model) and a post-check (after the model responds) are needed:

| Check | Where | Purpose |
|---|---|---|
| **Pre-check** | Before LLM call | Catches obviously out-of-scope questions early — saves an embedding call, a vector search, and an API call. |
| **Post-check** | After LLM call | Catches cases where the model drifts into forbidden territory despite the prompt and retrieved context. |

### 11. Deploy

Push the project to GitHub and deploy it using:

- Vercel
- Railway

The app must be live at a public URL.

### 12. The Failure Log

Write 10 questions across these 4 categories:

1. Nutrient requirements
2. Food safety and storage
3. Cooking methods
4. Questions where nobody has a clear answer

Run all 10 questions.

For each response, record:

- Claims stated as fact with nothing behind them
- Numbers that shift between runs
- Sources it cited that you can't find (phantom sources)
- Questions it should have declined
- Questions where it hedged into uselessness
- Claims with no citation when one should exist (missing citations)
- Two documents merged into a single claim (blended sources)
- Questions the corpus doesn't cover but the model answered anyway

Group the failures and count them.

> [!IMPORTANT]
> Don't hardcode fixes. Just record the failures.

---

## Tools You Can Use

| Area                  | Tools                                    |
|-----------------------|------------------------------------------|
| Frontend and Backend  | Next.js or React with FastAPI            |
| Scaffolding           | Cursor or Antigravity                    |
| Model                 | Anthropic or OpenAI API                  |
| Storage               | Supabase or Postgres                     |
| Vector Database       | Pinecone or ChromaDB                     |
| PDF Processing        | pdf-parse + custom section splitter      |
| Deployment            | Vercel or Railway                        |

### Model Requirements

Both Anthropic and OpenAI have structured output modes. Use structured outputs rather than parsing prose yourself.

---

## Rules

1. Every response must parse against your schema.
2. The schema must include a claims list and a source field for each claim.
3. Every claim must carry a citation from the corpus. Claims that can't be cited must have `source: null` and be explicitly marked as uncitable.
4. Scope limits must live in code, not just in the prompt.
5. The app must be live at a public URL.
6. Failures must be recorded, not patched around.
7. Model calls must run behind your backend.
8. The assistant must answer only from retrieved corpus chunks — not from its own training data.
9. Cross-document questions must cite each source separately — never blend.
10. When the corpus doesn't cover a question, the assistant must say so and name what it searched.
