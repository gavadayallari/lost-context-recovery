import { pool } from "../config/database";

export const getSyncSummary = async (
  jobId: string
) => {
  const jobResult = await pool.query(
    `
    SELECT
      sj.id,
      sj.status,
      sj.progress,
      sj.error_message,
      sj.started_at,
      sj.completed_at,
      r.id AS repository_id,
      r.owner,
      r.name,
      r.full_name,
      r.description,
      r.language,
      r.stars,
      r.forks,
      r.is_private
    FROM sync_jobs sj
    JOIN repositories r
      ON sj.repository_id = r.id
    WHERE sj.id = $1::UUID
    LIMIT 1;
    `,
    [jobId]
  );

  const job = jobResult.rows[0];

  if (!job) {
    throw new Error("Sync job not found");
  }

  const repositoryId = job.repository_id;

  const [
    commitsResult,
    issuesResult,
    pullRequestsResult,
    documentsResult,
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
  ]);

  return {
    job: {
      id: job.id,
      status: job.status,
      progress: job.progress,
      errorMessage: job.error_message,
      startedAt: job.started_at,
      completedAt: job.completed_at,
    },

    repository: {
      id: job.repository_id,
      owner: job.owner,
      name: job.name,
      fullName: job.full_name,
      description: job.description,
      language: job.language,
      stars: job.stars,
      forks: job.forks,
      isPrivate: job.is_private,
    },

    counts: {
      commits: commitsResult.rows[0].count,
      issues: issuesResult.rows[0].count,
      pullRequests: pullRequestsResult.rows[0].count,
      documents: documentsResult.rows[0].count,
    },
  };
};