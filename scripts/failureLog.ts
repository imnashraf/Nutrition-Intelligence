import fs from "fs";
import path from "path";

type TestQuestion = {
  id: number;
  category: string;
  question: string;
};

const QUESTIONS_PATH = path.join(process.cwd(), "scripts", "testQuestions.json");
const REPORT_PATH = path.join(process.cwd(), "docs", "failureReport.md");

async function main() {
  console.log("Reading test questions...");
  const questions: TestQuestion[] = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf-8"));

  const results = [];

  for (const q of questions) {
    console.log(`Processing Q${q.id}: ${q.question}`);
    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: null, message: q.question }),
      });
      const data = await res.json();
      results.push({
        question: q,
        response: data,
        status: res.status,
      });
    } catch (err: any) {
      console.error(`Error on Q${q.id}:`, err);
      results.push({
        question: q,
        error: err.message,
      });
    }
  }

  console.log("Generating docs/failureReport.md...");

  const dateStr = new Date().toISOString().split("T")[0];
  let md = `# Failure Report\nRun date: ${dateStr}\n\n`;
  
  md += `## Summary\n`;
  md += `| Failure Type                   | Count |\n`;
  md += `|--------------------------------|-------|\n`;
  md += `| Unsupported facts              |   0   |\n`;
  md += `| Unstable numbers               |   0   |\n`;
  md += `| Phantom sources                |   0   |\n`;
  md += `| Should have declined           |   0   |\n`;
  md += `| Hedged into uselessness        |   0   |\n`;
  md += `| Missing citation               |   0   |\n`;
  md += `| Blended sources                |   0   |\n`;
  md += `| Should have said not covered   |   0   |\n\n`;

  md += `## Detailed Results\n\n`;

  for (const r of results) {
    md += `### Q${r.question.id}: ${r.question.question}\n`;
    md += `**Category**: ${r.question.category}\n\n`;

    if (r.error) {
      md += `**Error**: ${r.error}\n\n`;
    } else {
      md += `**Raw Response**:\n\`\`\`json\n${JSON.stringify(r.response, null, 2)}\n\`\`\`\n\n`;
    }

    md += `**Annotations**:\n`;
    md += `- [ ] unsupported_facts\n`;
    md += `- [ ] unstable_numbers\n`;
    md += `- [ ] phantom_sources\n`;
    md += `- [ ] should_have_declined\n`;
    md += `- [ ] hedged_into_uselessness\n`;
    md += `- [ ] missing_citation\n`;
    md += `- [ ] blended_sources\n`;
    md += `- [ ] should_have_said_not_covered\n`;
    md += `\n**Notes**: \n\n---\n\n`;
  }

  fs.writeFileSync(REPORT_PATH, md);
  console.log("Report generated at docs/failureReport.md");
}

main().catch(console.error);
