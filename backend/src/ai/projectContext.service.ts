import { pool } from "../config/database";

export const buildProjectContext = async (
  repositoryId: string
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

  const repository =
    repositoryResult.rows[0];

  if (!repository) {
    throw new Error("Repository not found");
  }

  const commitsResult = await pool.query(
    `
    SELECT
      message,
      author,
      commit_date,
      url
    FROM commits
    WHERE repository_id = $1::UUID
    ORDER BY commit_date DESC NULLS LAST
    LIMIT 20;
    `,
    [repositoryId]
  );

  const issuesResult = await pool.query(
    `
    SELECT
      issue_number,
      title,
      body,
      state,
      author,
      created_at_github,
      updated_at_github,
      url
    FROM issues
    WHERE repository_id = $1::UUID
    ORDER BY created_at_github DESC NULLS LAST
    LIMIT 20;
    `,
    [repositoryId]
  );

  const pullRequestsResult = await pool.query(
    `
    SELECT
      pr_number,
      title,
      body,
      state,
      author,
      created_at_github,
      updated_at_github,
      url
    FROM pull_requests
    WHERE repository_id = $1::UUID
    ORDER BY created_at_github DESC NULLS LAST
    LIMIT 20;
    `,
    [repositoryId]
  );

  const documentsResult = await pool.query(
    `
    SELECT
      name,
      path,
      content
    FROM documents
    WHERE repository_id = $1::UUID
    ORDER BY path ASC;
    `,
    [repositoryId]
  );

  const readmeDocument =
    documentsResult.rows.find(
      (document) =>
        typeof document.content === "string" &&
        document.content.trim().length > 0
    );

  return {
    repository: {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      description:
        repository.description ?? null,
      language:
        repository.language ?? null,
      stars: Number(repository.stars ?? 0),
      forks: Number(repository.forks ?? 0),
      visibility: repository.is_private
        ? "private"
        : "public",
    },

    readme: readmeDocument
      ? {
          name: readmeDocument.name,
          path: readmeDocument.path,
          content: readmeDocument.content,
        }
      : null,

    commits: commitsResult.rows,
    issues: issuesResult.rows,
    pullRequests: pullRequestsResult.rows,

    projectStats: {
      commitCount:
        commitsResult.rows.length,
      issueCount:
        issuesResult.rows.length,
      pullRequestCount:
        pullRequestsResult.rows.length,
      readmeAvailable:
        Boolean(readmeDocument),
    },
  };
};
