import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith("sk-or-");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: isOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
});

export const testAI = async () => {
  try {
    const response = await client.chat.completions.create({
      model: isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello in one short sentence." }],
    });

    console.log("OpenAI test response:", response.choices[0]?.message?.content);
  } catch (error) {
    console.error("OpenAI test failed:", error);
  }
};