import { pool } from "../config/database";

export const getRepositories = async () => {
  const result = await pool.query(`
    SELECT
      id,
      owner,
      name,
      full_name,
      description,
      language,
      stars,
      forks,
      is_private,
      created_at,
      updated_at
    FROM repositories
    ORDER BY updated_at DESC NULLS LAST;
  `);

  return result.rows;
};