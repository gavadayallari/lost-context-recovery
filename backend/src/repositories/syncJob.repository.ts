import { pool } from "../config/database";

type CreateSyncJobData = {
  repositoryId: string;
};

export const createSyncJob = async (
  data: CreateSyncJobData
) => {
  const query = `
    INSERT INTO sync_jobs (
      repository_id,
      status,
      progress
    )
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    data.repositoryId,
    "pending",
    0,
  ]);

  return result.rows[0];
};

export const updateSyncJob = async (
  jobId: string,
  status: string,
  progress: number,
  errorMessage: string | null = null
) => {
  const query = `
    UPDATE sync_jobs
    SET
      status = $2::VARCHAR(30),
      progress = $3::INTEGER,
      error_message = $4::TEXT,
      started_at = CASE
        WHEN $2::VARCHAR(30) = 'running'
        THEN COALESCE(started_at, CURRENT_TIMESTAMP)
        ELSE started_at
      END,
      completed_at = CASE
        WHEN $2::VARCHAR(30) IN ('completed', 'failed')
        THEN CURRENT_TIMESTAMP
        ELSE completed_at
      END
    WHERE id = $1::UUID
    RETURNING *;
  `;

  const result = await pool.query(query, [
    jobId,
    status,
    progress,
    errorMessage,
  ]);

  return result.rows[0] ?? null;
};

export const getSyncJobById = async (
  jobId: string
) => {
  const query = `
    SELECT *
    FROM sync_jobs
    WHERE id = $1::UUID
    LIMIT 1;
  `;

  const result = await pool.query(query, [jobId]);

  return result.rows[0] ?? null;
};