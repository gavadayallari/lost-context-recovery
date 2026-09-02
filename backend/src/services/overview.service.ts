import { pool } from "../config/database";

export const getProjectOverview = async (
  owner: string,
  repo: string
) => {
  const fullName = `${owner}/${repo}`;

  const repositoryResult = await pool.query(
    `
    SELECT
      id,
      owner,
      name,
      full_name,
      description,
      url,
      language,
      stars,
      forks,
      is_private,
      created_at,
      updated_at
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

  const repositoryId = repository.id;

  const [
    commitsCount,
    issuesCount,
    pullRequestsCount,
    documentsCount,
    latestCommit,
  ] = await Promise.all([
    pool.query(
      `
      SELECT COUNT(*)::INTEGER AS count
      FROM commits
      WHERE repository_id = $1::UUID;
      `,
      [repositoryId]
    ),

    pool.query(
      `
      SELECT COUNT(*)::INTEGER AS count
      FROM issues
      WHERE repository_id = $1::UUID;
      `,
      [repositoryId]
    ),

    pool.query(
      `
      SELECT COUNT(*)::INTEGER AS count
      FROM pull_requests
      WHERE repository_id = $1::UUID;
      `,
      [repositoryId]
    ),

    pool.query(
      `
      SELECT COUNT(*)::INTEGER AS count
      FROM documents
      WHERE repository_id = $1::UUID;
      `,
      [repositoryId]
    ),

    pool.query(
      `
      SELECT
        sha,
        message,
        author,
        commit_date,
        url
      FROM commits
      WHERE repository_id = $1::UUID
      ORDER BY commit_date DESC NULLS LAST
      LIMIT 1;
      `,
      [repositoryId]
    ),
  ]);

  return {
    project: {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      language: repository.language,
      stars: repository.stars,
      forks: repository.forks,
      isPrivate: repository.is_private,
      url: repository.url,
    },

    activity: {
      latestCommit:
        latestCommit.rows[0] ?? null,
    },

    counts: {
      commits: commitsCount.rows[0].count,
      issues: issuesCount.rows[0].count,
      pullRequests:
        pullRequestsCount.rows[0].count,
      documents:
        documentsCount.rows[0].count,
    },

    hasReadme:
      Number(documentsCount.rows[0].count) > 0,
  };
};