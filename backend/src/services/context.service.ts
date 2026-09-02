import { pool } from "../config/database";

export const getProjectContext = async (
  owner: string,
  repo: string
) => {
  const fullName = `${owner}/${repo}`;

  const repositoryResult = await pool.query(
    `
    SELECT *
    FROM repositories
    WHERE full_name = $1
    LIMIT 1
    `,
    [fullName]
  );

  const repository = repositoryResult.rows[0];

  if (!repository) {
    throw new Error(
      "Repository not found in database"
    );
  }

  const commitsResult = await pool.query(
    `
    SELECT *
    FROM commits
    WHERE repository_id = $1
    ORDER BY commit_date DESC NULLS LAST
    LIMIT 20
    `,
    [repository.id]
  );

  const issuesResult = await pool.query(
    `
    SELECT *
    FROM issues
    WHERE repository_id = $1
    ORDER BY issue_number DESC
    `,
    [repository.id]
  );

  const pullRequestsResult = await pool.query(
    `
    SELECT *
    FROM pull_requests
    WHERE repository_id = $1
    ORDER BY pr_number DESC
    `,
    [repository.id]
  );

  const documentsResult = await pool.query(
    `
    SELECT *
    FROM documents
    WHERE repository_id = $1
    ORDER BY path
    `,
    [repository.id]
  );

  return {
    repository,
    commits: commitsResult.rows,
    issues: issuesResult.rows,
    pullRequests: pullRequestsResult.rows,
    documents: documentsResult.rows,
  };
};