import { pool } from "../config/database";

export type DocumentData = {
  repositoryId: string;
  name: string;
  path: string;
  content: string;
  url: string;
};

export const saveDocument = async (
  document: DocumentData
) => {
  const query = `
    INSERT INTO documents (
      repository_id,
      name,
      path,
      content,
      url
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (repository_id, path)
    DO UPDATE SET
      name = EXCLUDED.name,
      content = EXCLUDED.content,
      url = EXCLUDED.url,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [
    document.repositoryId,
    document.name,
    document.path,
    document.content,
    document.url,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};