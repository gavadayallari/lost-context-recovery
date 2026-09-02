import { pool } from "../config/database";

type CommitData = {
  repositoryId: string;
  sha: string;
  message: string;
  author: string;
  date: string | null;
  url: string;
};

export const saveCommit = async (commit: CommitData) => {
  const query = `
    INSERT INTO commits (
      repository_id,
      sha,
      message,
      author,
      commit_date,
      url
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (repository_id, sha)
    DO UPDATE SET
      message = EXCLUDED.message,
      author = EXCLUDED.author,
      commit_date = EXCLUDED.commit_date,
      url = EXCLUDED.url
    RETURNING *;
  `;

  const values = [
    commit.repositoryId,
    commit.sha,
    commit.message,
    commit.author,
    commit.date,
    commit.url,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const saveCommits = async (commits: CommitData[]) => {
  const savedCommits = [];

  for (const commit of commits) {
    const savedCommit = await saveCommit(commit);
    savedCommits.push(savedCommit);
  }

  return savedCommits;
};