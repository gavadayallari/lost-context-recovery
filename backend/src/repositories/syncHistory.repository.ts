import { pool } from "../config/database";

export const getSyncHistoryByRepository = async (
  repositoryId: string
) => {
  const query = `
    SELECT
      id,
      repository_id,
      status,
      progress,
      error_message,
      started_at,
      completed_at,
      created_at
    FROM sync_jobs
    WHERE repository_id = $1::UUID
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [
    repositoryId,
  ]);

  return result.rows;
};

export const getSyncHistoryByRepositoryFullName =
  async (
    fullName: string
  ) => {
    const query = `
      SELECT
        sj.id,
        sj.repository_id,
        sj.status,
        sj.progress,
        sj.error_message,
        sj.started_at,
        sj.completed_at,
        sj.created_at,
        r.full_name
      FROM sync_jobs sj
      JOIN repositories r
        ON sj.repository_id = r.id
      WHERE LOWER(r.full_name) = LOWER($1)
      ORDER BY sj.created_at DESC;
    `;

    const result = await pool.query(query, [
      fullName,
    ]);

    return result.rows;
  };