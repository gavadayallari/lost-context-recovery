import { pool } from "../config/database";

export const getProjectTimeline = async (
  owner: string,
  repo: string
) => {
  const fullName = `${owner}/${repo}`;

  const repositoryResult = await pool.query(
    `
    SELECT id, full_name
    FROM repositories
    WHERE full_name = $1
    LIMIT 1;
    `,
    [fullName]
  );

  const repository = repositoryResult.rows[0];

  if (!repository) {
    throw new Error(
      "Repository not found in database"
    );
  }

  const timelineResult = await pool.query(
    `
    SELECT
      'commit' AS event_type,
      sha AS reference,
      message AS title,
      author,
      commit_date AS event_date,
      url
    FROM commits
    WHERE repository_id = $1::UUID

    UNION ALL

    SELECT
      'issue' AS event_type,
      issue_number::TEXT AS reference,
      title,
      author,
      created_at_github AS event_date,
      url
    FROM issues
    WHERE repository_id = $1::UUID

    UNION ALL

    SELECT
      'pull_request' AS event_type,
      pr_number::TEXT AS reference,
      title,
      author,
      created_at_github AS event_date,
      url
    FROM pull_requests
    WHERE repository_id = $1::UUID

    ORDER BY event_date DESC NULLS LAST;
    `,
    [repository.id]
  );

  return {
    repository: repository.full_name,
    timeline: timelineResult.rows,
  };
};