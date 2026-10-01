# Nutrition Intelligence

A RAG-powered nutrition and food safety assistant built with Next.js, Postgres, Pinecone, and Groq.

## Features

- **Strict Adherence:** Answers are strictly grounded in an authoritative document corpus.
- **Scope Guards:** Automatically rejects out-of-scope medical, weight-loss, or irrelevant queries.
- **Citation System:** Provides inline citations to specific document sections.
- **Structured JSON Output:** Backend guarantees responses in predictable JSON format.
- **Glassmorphism UI:** A sleek, modern chat interface tailored for an excellent user experience.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL (with `pg` driver) for conversation and metadata storage
- **Vector DB:** Pinecone for similarity search
- **LLM & Embeddings:** Groq (llama3-70b-8192) for high-speed generation (embeddings are mock-only via Groq for this project context)

## Setup Instructions

1. **Clone the repository and install dependencies:**

   ```bash
   git clone <repo-url>
   cd Nutrition-Intelligence
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add:

   ```env
   # LLM
   GROQ_API_KEY=your_groq_api_key
   
   # Pinecone Vector DB
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX=your_pinecone_index_name
   
   # PostgreSQL
   DATABASE_URL=your_postgres_connection_string
   ```

3. **Initialize Database and Vector Index:**
   Initialize the PostgreSQL tables:
   ```bash
   npx tsx scripts/setupDb.ts
   ```
   
   Ingest the test corpus into Pinecone:
   ```bash
   npx tsx scripts/ingest.ts
   ```

4. **Run the Development Server:**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

This project is optimized for deployment on Vercel. 
Simply import the repository in your Vercel dashboard and provide the required environment variables.

Live Application URL: *(Pending Deployment)*

## Testing & Automation

Run the failure log system to regression-test LLM prompt changes:

```bash
npx tsx scripts/failureLog.ts
```

Results will be output to `docs/failureReport.md`.
