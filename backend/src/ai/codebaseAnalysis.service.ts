import { pool } from "../config/database";

export const analyzeCodebase = async (
  repositoryId: string,
  syncStats?: { filesDiscovered: number, filesIndexed: number, filesSkipped: number, totalSize: number }
) => {
  const documentsResult = await pool.query(
    `SELECT path, name, content FROM documents WHERE repository_id = $1::UUID`,
    [repositoryId]
  );

  const docs = documentsResult.rows;
  const paths = docs.map(d => d.path);

  const configurationFiles = paths.filter(p => p.includes("config") || p.endsWith(".json") || p.endsWith(".yaml") || p.endsWith(".yml") || p.endsWith(".toml") || p.includes("docker"));
  const documentationFiles = paths.filter(p => p.endsWith(".md") || p.endsWith(".mdx") || p.endsWith(".txt"));

  // Find package.json
  const pkgJsonDoc = docs.find(d => d.name === "package.json" || d.path.endsWith("/package.json"));
  let deps: Record<string, string> = {};
  let devDeps: Record<string, string> = {};
  let scripts: Record<string, string> = {};

  if (pkgJsonDoc && pkgJsonDoc.content) {
    try {
      const pkg = JSON.parse(pkgJsonDoc.content);
      deps = pkg.dependencies || {};
      devDeps = pkg.devDependencies || {};
      scripts = pkg.scripts || {};
    } catch (e) {
      // Ignore parse error
    }
  }

  const allDeps = { ...deps, ...devDeps };

  const frameworks: string[] = [];
  if (allDeps["react"]) frameworks.push("React");
  if (allDeps["next"]) frameworks.push("Next.js");
  if (allDeps["vue"]) frameworks.push("Vue");
  if (allDeps["@angular/core"]) frameworks.push("Angular");
  if (allDeps["express"]) frameworks.push("Express");
  if (allDeps["@nestjs/core"]) frameworks.push("NestJS");
  if (paths.some(p => p.endsWith("requirements.txt") && docs.find(d => d.path === p)?.content?.includes("Django"))) frameworks.push("Django");
  if (paths.some(p => p.endsWith("pom.xml") && docs.find(d => d.path === p)?.content?.includes("spring-boot"))) frameworks.push("Spring Boot");

  const languages: string[] = [];
  if (paths.some(p => p.endsWith(".ts") || p.endsWith(".tsx"))) languages.push("TypeScript");
  if (paths.some(p => p.endsWith(".js") || p.endsWith(".jsx"))) languages.push("JavaScript");
  if (paths.some(p => p.endsWith(".py"))) languages.push("Python");
  if (paths.some(p => p.endsWith(".go"))) languages.push("Go");
  if (paths.some(p => p.endsWith(".java"))) languages.push("Java");

  const isFrontend = frameworks.some(f => ["React", "Next.js", "Vue", "Angular"].includes(f)) || paths.some(p => p.includes("src/components") || p.includes("src/pages") || p.endsWith("index.html") || p.includes("app/page."));
  const hasNextJsApi = paths.some(p => p.includes("pages/api/") || p.includes("src/pages/api/") || p.includes("app/api/") || p.includes("src/app/api/"));
  const isBackend = frameworks.some(f => ["Express", "NestJS", "Django", "Spring Boot"].includes(f)) || paths.some(p => p.includes("src/routes") || p.includes("src/controllers")) || hasNextJsApi;

  let projectType = "Unknown";
  if (isFrontend && isBackend) projectType = "Fullstack (Next.js/Nuxt or Frontend+Backend)";
  else if (isFrontend) projectType = "Frontend";
  else if (isBackend) projectType = "Backend";

  const entryPoints = paths.filter(p => p.match(/(index|main|app|server)\.(ts|js|py|go|java)$/i));
  const hasDatabase = paths.some(p => p.includes("prisma") || p.includes("typeorm") || p.includes("mongoose") || p.includes("sql") || p.includes("migration"));
  const hasDocker = paths.some(p => p.toLowerCase().includes("dockerfile"));
  const hasTests = paths.some(p => p.includes(".test.") || p.includes(".spec.") || p.includes("__tests__"));

  const structure = {
    projectType,
    languages,
    frameworks,
    entryPoints,
    frontend: isFrontend,
    backend: isBackend,
    database: hasDatabase,
    testing: hasTests,
    docker: hasDocker,
    totalFiles: paths.length,
    filesDiscovered: syncStats?.filesDiscovered || paths.length,
    filesIndexed: syncStats?.filesIndexed || paths.length,
    filesSkipped: syncStats?.filesSkipped || 0,
    configurationFiles: configurationFiles.length,
    documentationFiles: documentationFiles.length,
  };

  const summary = `
This is a ${projectType} project written primarily in ${languages.join(", ") || "Unknown"}.
Key frameworks detected: ${frameworks.join(", ") || "None"}.
The project has ${hasDatabase ? "database integration" : "no obvious database integration"}, ${hasTests ? "testing setups" : "no obvious tests"}, and ${hasDocker ? "Docker configuration" : "no Docker configuration"}.
Main entry points include: ${entryPoints.slice(0, 3).join(", ")}.

Repository Indexing Stats:
Files discovered: ${structure.filesDiscovered}
Source files indexed: ${structure.filesIndexed}
Configuration files: ${structure.configurationFiles}
Documentation files: ${structure.documentationFiles}
Skipped generated/binary files: ${structure.filesSkipped}
  `.trim();

  await pool.query(
    `
    INSERT INTO repository_summaries (repository_id, summary, structure)
    VALUES ($1, $2, $3)
    ON CONFLICT (repository_id)
    DO UPDATE SET
      summary = EXCLUDED.summary,
      structure = EXCLUDED.structure,
      updated_at = CURRENT_TIMESTAMP;
    `,
    [repositoryId, summary, JSON.stringify(structure)]
  );

  return { summary, structure };
};
