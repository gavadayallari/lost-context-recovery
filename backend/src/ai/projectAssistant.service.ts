import OpenAI from "openai";
import { answerProjectQuestion as fallbackAnswerProjectQuestion } from "../services/projectQuestion.service";
import { buildProjectContext } from "./projectContext.service";
import { pool } from "../config/database";

const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith("sk-or-");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
  baseURL: isOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
});

export const askAssistant = async (
  owner: string,
  repo: string,
  question: string
) => {
  try {
    const fullName = `${owner}/${repo}`;
    const repositoryResult = await pool.query(
      `SELECT id FROM repositories WHERE LOWER(full_name) = LOWER($1) LIMIT 1;`,
      [fullName]
    );

    const repository = repositoryResult.rows[0];
    if (!repository) {
      throw new Error("Repository not found in database");
    }

    const repositoryId = repository.id as string;
    const context = await buildProjectContext(repositoryId);

    const systemPrompt = `You are Lost Context Recovery, a software project understanding assistant.

Answer questions using ONLY the supplied repository context.
The current repository is the only source of truth.
Never mix information from another repository.
Never invent files, features, architecture, issues, pull requests, commits, technologies, or behavior.
If the answer is not present in the supplied context, say that the information is not available.
Give practical and developer-friendly explanations.

Project Context:
${JSON.stringify(context, null, 2)}
`;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key missing");
    }

    const response = await openai.chat.completions.create({
      model: isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    return {
      answer: response.choices[0]?.message?.content || "",
      source: "openai",
      ai: true,
    };
  } catch (error: any) {
    console.warn("OpenAI failed or missing, falling back to local logic:", error);
    const fallback = await fallbackAnswerProjectQuestion(owner, repo, question);
    return {
      answer: fallback.answer,
      source: "local-project-context",
      ai: false,
    };
  }
};
