import { pool } from "../config/database";

export const buildProjectContext = async (
  repositoryId: string,
  question: string = ""
) => {
  const repositoryResult = await pool.query(
    `
    SELECT
      id,
      name,
      full_name,
      description,
      language,
      stars,
      forks,
      is_private
    FROM repositories
    WHERE id = $1::UUID
    LIMIT 1;
    `,
    [repositoryId]
  );

  const repository = repositoryResult.rows[0];
  if (!repository) {
    throw new Error("Repository not found");
  }

  const commitsResult = await pool.query(
    `
    SELECT message, author, commit_date, url
    FROM commits
    WHERE repository_id = $1::UUID
    ORDER BY commit_date DESC NULLS LAST
    LIMIT 10;
    `,
    [repositoryId]
  );

  const documentsResult = await pool.query(
    `
    SELECT name, path, content, file_type, language
    FROM documents
    WHERE repository_id = $1::UUID
    ORDER BY path ASC;
    `,
    [repositoryId]
  );

  const allDocs = documentsResult.rows;
  const repositoryTree = allDocs.map(doc => doc.path).join("\n");

  // Relevance filtering based on question
  const q = question.toLowerCase();
  let relevantDocs = [];

  const isTechStack = q.includes("technolog") || q.includes("stack") || q.includes("dependenc");
  const isAuth = q.includes("auth") || q.includes("login") || q.includes("sign");
  const isDb = q.includes("database") || q.includes("sql") || q.includes("prisma") || q.includes("orm");
  const isFrontend = q.includes("frontend") || q.includes("ui") || q.includes("component") || q.includes("page");
  const isBackend = q.includes("backend") || q.includes("api") || q.includes("endpoint") || q.includes("route");
  const isGeneral = q.includes("explain") || q.includes("what is") || q.includes("how does") || q.includes("architecture") || q.trim() === "";

  for (const doc of allDocs) {
    const p = doc.path.toLowerCase();
    let score = 0;

    if (p.includes("package.json") || p.includes("readme") || p.match(/(index|main|app|server)\.(ts|js|py|go|java)$/i)) {
      score += 10; // Always prioritize core files highly
    }
    if (isTechStack && (p.includes("package.json") || p.includes("config") || p.includes("requirements.txt") || p.includes("pom.xml"))) {
      score += 10;
    }
    if (isAuth && p.includes("auth")) score += 10;
    if (isDb && (p.includes("database") || p.includes("db") || p.includes("schema") || p.includes("migration"))) score += 10;
    if (isFrontend && (p.includes("src/pages") || p.includes("src/components") || p.includes("src/app"))) score += 10;
    if (isBackend && (p.includes("src/routes") || p.includes("src/controllers") || p.includes("server") || p.includes("api") || p.includes("services"))) score += 10;

    if (isGeneral) {
      if (p.includes("routes") || p.includes("router")) score += 8;
      if (p.includes("docker") || p.includes("config") || p.includes("env")) score += 7;
      if (p.includes("services/") || p.includes("api/")) score += 6;
      if (p.includes("pages/") || p.includes("views/")) score += 5;
      if (p.includes("components/")) score += 4;
      if (p.includes("utils/") || p.includes("lib/")) score += 3;
    }

    // Lexical match in path and content
    const stopWords = new Set(['what', 'where', 'when', 'how', 'explain', 'trace', 'project', 'show', 'the', 'this', 'that', 'from', 'to', 'and', 'or', 'feature']);
    const keywords = q.split(/[\s,.-]+/).filter(w => w.length > 3 && !stopWords.has(w));

    for (const kw of keywords) {
      if (p.includes(kw)) score += 8;
      if (doc.content && doc.content.toLowerCase().includes(kw)) score += 3;
    }

    // Give all source files a baseline score if they are not already scored
    // This allows them to be included if there's room, but prioritized lower than core files
    if (score === 0 && (p.endsWith(".ts") || p.endsWith(".js") || p.endsWith(".tsx") || p.endsWith(".jsx") || p.endsWith(".py") || p.endsWith(".go") || p.endsWith(".java"))) {
      score = 1;
    }

    if (score > 0) {
      relevantDocs.push({ doc, score });
    }
  }

  // Sort relevantDocs by initial score to prepare for tracing
  relevantDocs.sort((a, b) => b.score - a.score);

  // Pass 2: Cross-file trace scoring (Imports and Exports)
  const topDocs = relevantDocs.slice(0, 15).map(item => item.doc);
  const traceKeywords = new Set<string>();
  const excludeTrace = new Set(['react', 'vue', 'express', 'next', 'axios', 'index', 'app', 'main', 'server', 'config', 'env', 'utils']);

  for (const doc of topDocs) {
    if (!doc.content) continue;

    // Extract imports
    const importRegex = /(?:import|require)\s+.*?(?:from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(doc.content)) !== null) {
      const importPath = match[1];
      if (importPath) {
        const baseName = importPath.split('/').pop()?.replace(/\.(tsx|ts|js|jsx)$/, '');
        if (baseName && baseName.length > 2 && !excludeTrace.has(baseName.toLowerCase())) {
          traceKeywords.add(baseName.toLowerCase());
        }
      }
    }

    // Extract exported functions/classes
    const exportRegex = /export\s+(?:const|function|class|default)\s+([a-zA-Z0-9_]+)/g;
    while ((match = exportRegex.exec(doc.content)) !== null) {
      const exportName = match[1];
      if (exportName && exportName.length > 3 && !excludeTrace.has(exportName.toLowerCase())) {
        traceKeywords.add(exportName.toLowerCase());
      }
    }
  }

  // Score docs based on trace keywords to pull in connected files
  if (traceKeywords.size > 0) {
    for (const doc of allDocs) {
      const p = doc.path.toLowerCase();
      let traceScore = 0;

      for (const tk of traceKeywords) {
        if (p.includes(tk)) traceScore += 5;
        if (doc.content && doc.content.toLowerCase().includes(tk)) traceScore += 1;
      }

      if (traceScore > 0) {
        const existing = relevantDocs.find(r => r.doc.path === doc.path);
        if (existing) {
          existing.score += traceScore;
        } else {
          relevantDocs.push({ doc, score: traceScore });
        }
      }
    }
  }

  // Sort by score
  relevantDocs.sort((a, b) => b.score - a.score);

  // Take top N and chunk
  const chunks = [];
  let totalChars = 0;
  const MAX_CHARS = 30000;

  for (const { doc } of relevantDocs) {
    if (totalChars > MAX_CHARS) break;
    if (!doc.content || doc.content.trim() === "") continue;

    const lines = doc.content.split("\n");
    let currentChunk = [];
    let startLine = 1;

    for (let i = 0; i < lines.length; i++) {
      currentChunk.push(lines[i]);
      if (currentChunk.length >= 200 || i === lines.length - 1) { // 200 lines per chunk
        const chunkText = currentChunk.join("\n");
        chunks.push({
          repositoryId,
          path: doc.path,
          language: doc.language || "text",
          startLine,
          endLine: i + 1,
          content: chunkText
        });
        totalChars += chunkText.length;
        startLine = i + 2;
        currentChunk = [];
        if (totalChars > MAX_CHARS) break;
      }
    }
  }

  const summaryResult = await pool.query(
    `SELECT summary, structure FROM repository_summaries WHERE repository_id = $1::UUID LIMIT 1;`,
    [repositoryId]
  );

  return {
    repository: {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description ?? null,
      language: repository.language ?? null,
      stars: Number(repository.stars ?? 0),
      forks: Number(repository.forks ?? 0),
      visibility: repository.is_private ? "private" : "public",
    },
    projectSummary: summaryResult.rows[0]?.summary ?? null,
    projectStructure: summaryResult.rows[0]?.structure ?? null,
    repositoryTree,
    sourceCodeChunks: chunks,
    commits: commitsResult.rows,
  };
};
