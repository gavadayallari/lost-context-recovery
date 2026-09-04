import { Octokit } from "@octokit/rest";
import { pool } from "../config/database";
import { handleGitHubError } from "./github.utils";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const MAX_FILE_SIZE = 500 * 1024; // 500 KB

const INCLUDED_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs", ".php", ".rb", ".cs", ".cpp", ".c", ".h",
  ".html", ".css", ".scss", ".json", ".yaml", ".yml", ".toml", ".xml", ".sql", ".md", ".mdx"
];

const EXCLUDED_DIRS = [
  "node_modules", "dist", "build", "coverage", ".git", ".github", "vendor", "target", "__pycache__"
];

const EXCLUDED_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".mp4", ".mov", ".zip", ".exe", ".dll", ".so", ".class"
];

const SECRET_FILES = [
  ".env", ".env.local", ".env.production", ".env.development", ".env.test", "secret", "credentials", "id_rsa", "id_dsa"
];

function isRelevantFile(path: string, size: number): boolean {
  if (size > MAX_FILE_SIZE) return false;

  const parts = path.split("/");
  const fileName = parts[parts.length - 1] || "";

  // Exclude directories
  for (const dir of EXCLUDED_DIRS) {
    if (parts.includes(dir)) return false;
  }

  // Secret protection
  const lowerFileName = fileName.toLowerCase();
  for (const secret of SECRET_FILES) {
    if (lowerFileName.includes(secret) && lowerFileName !== ".env.example") {
      return false;
    }
  }

  // Exclude extensions
  for (const ext of EXCLUDED_EXTENSIONS) {
    if (lowerFileName.endsWith(ext)) return false;
  }

  // Include by extension
  for (const ext of INCLUDED_EXTENSIONS) {
    if (lowerFileName.endsWith(ext)) return true;
  }

  // Include specific files
  const includedFiles = [
    "dockerfile", "docker-compose.yml", "package.json", "package-lock.json",
    "yarn.lock", "pnpm-lock.yaml", "requirements.txt", "pyproject.toml",
    "pom.xml", "build.gradle", "go.mod", "cargo.toml", ".env.example"
  ];
  if (includedFiles.includes(lowerFileName)) return true;

  // Patterns
  if (lowerFileName.startsWith("vite.config") ||
    lowerFileName.startsWith("next.config") ||
    lowerFileName.startsWith("tsconfig") ||
    lowerFileName.startsWith("tailwind.config")) {
    return true;
  }

  return false;
}

function getLanguageFromPath(path: string): string {
  const parts = path.split("/");
  const fileName = parts.pop() || "";
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "javascript";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".java")) return "java";
  if (lower.endsWith(".go")) return "go";
  if (lower.endsWith(".rs")) return "rust";
  if (lower.endsWith(".html")) return "html";
  if (lower.endsWith(".css") || lower.endsWith(".scss")) return "css";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md") || lower.endsWith(".mdx")) return "markdown";
  if (lower.endsWith(".sql")) return "sql";
  return "text";
}

export const syncRepositoryCode = async (
  owner: string,
  repo: string,
  repositoryId: string
) => {
  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: "1",
    });

    const relevantFiles = treeData.tree.filter(
      (item) => item.type === "blob" && typeof item.size === "number" && isRelevantFile(item.path || "", item.size)
    );

    // Fetch existing documents to prevent redundant updates
    const existingDocsResult = await pool.query(
      `SELECT path, sha FROM documents WHERE repository_id = $1::UUID`,
      [repositoryId]
    );
    const existingDocs = new Map<string, string>();
    for (const row of existingDocsResult.rows) {
      existingDocs.set(row.path, row.sha);
    }

    let filesIndexed = 0;
    let filesSkipped = 0;
    let totalSize = 0;

    // Process files in batches to respect rate limits
    for (const file of relevantFiles) {
      const path = file.path || "";
      const sha = file.sha || "";
      const size = file.size || 0;

      if (existingDocs.get(path) === sha) {
        // Unchanged
        filesSkipped++;
        totalSize += size;
        continue;
      }

      try {
        const { data: blobData } = await octokit.rest.git.getBlob({
          owner,
          repo,
          file_sha: sha,
        });

        const content = Buffer.from(blobData.content, "base64").toString("utf-8");
        const language = getLanguageFromPath(path);
        const name = path.split("/").pop() || "";
        const url = `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${path}`;

        await pool.query(
          `
          INSERT INTO documents (
            repository_id, name, path, content, url, file_type, language, size, sha
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (repository_id, path)
          DO UPDATE SET
            content = EXCLUDED.content,
            file_type = EXCLUDED.file_type,
            language = EXCLUDED.language,
            size = EXCLUDED.size,
            sha = EXCLUDED.sha,
            updated_at = CURRENT_TIMESTAMP;
          `,
          [repositoryId, name, path, content, url, "source", language, size, sha]
        );

        filesIndexed++;
        totalSize += size;
      } catch (err) {
        console.error(`Failed to fetch/save blob ${path}:`, err);
        filesSkipped++;
      }
    }

    // Optional: Delete files that no longer exist in the repository tree
    const currentPaths = new Set(relevantFiles.map((f) => f.path));
    const pathsToDelete = Array.from(existingDocs.keys()).filter((p) => !currentPaths.has(p));
    if (pathsToDelete.length > 0) {
      await pool.query(
        `DELETE FROM documents WHERE repository_id = $1::UUID AND path = ANY($2)`,
        [repositoryId, pathsToDelete]
      );
    }

    return {
      filesDiscovered: relevantFiles.length,
      filesIndexed,
      filesSkipped,
      totalSize,
    };
  } catch (error) {
    console.error("Repository sync failed:", error);
    throw handleGitHubError(error);
  }
};
