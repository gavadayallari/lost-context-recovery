import { pool } from "../config/database";

type PullRequestData = {
  repositoryId: string;
  prNumber: number;
  title: string;
  body: string | null;
  state: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  url: string;
};

export const savePullRequest = async (
  pullRequest: PullRequestData
) => {
  const query = `
    INSERT INTO pull_requests (
      repository_id,
      pr_number,
      title,
      body,
      state,
      author,
      created_at_github,
      updated_at_github,
      url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (repository_id, pr_number)
    DO UPDATE SET
      title = EXCLUDED.title,
      body = EXCLUDED.body,
      state = EXCLUDED.state,
      author = EXCLUDED.author,
      updated_at_github = EXCLUDED.updated_at_github,
      url = EXCLUDED.url
    RETURNING *;
  `;

  const values = [
    pullRequest.repositoryId,
    pullRequest.prNumber,
    pullRequest.title,
    pullRequest.body,
    pullRequest.state,
    pullRequest.author,
    pullRequest.createdAt,
    pullRequest.updatedAt,
    pullRequest.url,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const savePullRequests = async (
  pullRequests: PullRequestData[]
) => {
  const savedPullRequests = [];

  for (const pullRequest of pullRequests) {
    const savedPullRequest =
      await savePullRequest(pullRequest);

    savedPullRequests.push(savedPullRequest);
  }

  return savedPullRequests;
};