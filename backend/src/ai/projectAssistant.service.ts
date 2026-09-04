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
    const context = await buildProjectContext(repositoryId, question);

    const systemPrompt = `You are Lost Context Recovery, a software project understanding assistant.
You are analyzing the actual source code and repository structure of the selected GitHub repository.

Answer questions using ONLY the supplied repository context.
The current repository is the only source of truth.
Rules:
- NEVER say "likely", "appears", "probably", or "might be". Inspect the code and state facts.
- Clearly separate your response into sections: CONFIRMED FROM CODE, INFERENCE, and NOT FOUND where appropriate.
- Every important claim MUST include a real file path and, when possible, a function/class name. NEVER invent paths.
- Never call a file the "main entry point" unless verified from actual code/framework structure.
- Detect libraries/frameworks from actual imports/usages in the provided chunks, not just filenames.
- When saying "no backend", "no database", "no testing", or similar, verify against the full repository tree first.
- For Next.js projects, distinguish: src/pages/_app.tsx or app/layout.tsx (wrapper), index.tsx or page.tsx (homepage), and api/* (API routes / backend). Do not say "there is no backend" if Next.js API routes exist.
- Do not use another repository's information.
- Never invent files, features, architecture, issues, pull requests, commits, technologies, or behavior.
- If the answer is not present in the supplied context, say that the information is NOT FOUND.

When asked to "trace" a feature, follow actual source references strictly:
- UI component -> service function -> API helper -> exact endpoint -> API handler -> database/external API.
- Use actual imports, function calls, and endpoint definitions present in the context.
- Never invent paths/functions/endpoints.
- Never use unrelated API routes (e.g. auth routes when tracing jobs) if they are not explicitly called in the feature's flow.
- If a step is outside the repository, say: "Outside indexed repository."
- If it cannot be verified from the chunks, say: "Not found in indexed source."

When asked to "explain this project" or provide an overview, use the provided \`repositoryTree\` to analyze the folder structure, identify entry points, and infer the architecture (e.g. frontend, backend, or fullstack). Summarize the purpose, frameworks, database usage, API layers, and major modules based on the actual source chunks provided. Include file counts and statistics.

Give practical and developer-friendly explanations.

Project Context:
${JSON.stringify(context, null, 2)}
`;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key missing");
    }

    // Debugging Requirements
    const struct = context.projectStructure || {};
    console.log(`
==================================================
PROJECT INTELLIGENCE DEBUG
Repository: ${fullName}
Repository ID: ${repositoryId}
Files discovered: ${struct.filesDiscovered || 0}
Files indexed: ${struct.filesIndexed || 0}
Files skipped: ${struct.filesSkipped || 0}
Context files/chunks selected: ${context.sourceCodeChunks?.length || 0}
Relationships found: ${(context as any).codeRelationships?.length || 0}
Selected trace files: ${(context as any).tracedFiles?.length || 0}
==================================================
    `.trim());

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
