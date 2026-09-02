import { pool } from "../config/database";

type RepositoryData = {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
};

export const saveRepository = async (
  repository: RepositoryData
) => {
  const query = `
    INSERT INTO repositories (
      owner,
      name,
      full_name,
      description,
      url,
      language,
      stars,
      forks,
      is_private
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (full_name)
    DO UPDATE SET
      description = EXCLUDED.description,
      url = EXCLUDED.url,
      language = EXCLUDED.language,
      stars = EXCLUDED.stars,
      forks = EXCLUDED.forks,
      is_private = EXCLUDED.is_private,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [
    repository.owner,
    repository.name,
    repository.fullName,
    repository.description,
    repository.url,
    repository.language,
    repository.stars,
    repository.forks,
    repository.isPrivate,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const findRepositoryByFullName = async (
  fullName: string
) => {
  const query = `
    SELECT *
    FROM repositories
    WHERE full_name = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [fullName]);

  return result.rows[0] ?? null;
};