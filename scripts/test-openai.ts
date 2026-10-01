import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { getChatCompletion, RetrievedChunk } from "../lib/openai";

async function main() {
  const chunks: RetrievedChunk[] = [
    {
      documentTitle: "Safe Food Handling Guide",
      publisher: "FDA",
      year: 2023,
      sectionHeading: "Refrigerator and Freezer Storage",
      url: "https://www.fda.gov/food/buy-store-serve-safe-food",
      content: "Keep raw poultry at 40°F (4°C) or below. Store it in a sealed container on the bottom shelf of the refrigerator so its juices don't drip onto other foods."
    }
  ];

  const messages = [
    { role: "user" as const, content: "How should I store raw chicken?" }
  ];

  try {
    const response = await getChatCompletion(messages, chunks);
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
