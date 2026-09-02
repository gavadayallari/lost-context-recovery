import { pool } from "../config/database";

type IssueData = {
  repositoryId: string;
  issueNumber: number;
  title: string;
  body: string | null;
  state: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  url: string;
};

export const saveIssue = async (issue: IssueData) => {
  const query = `
    INSERT INTO issues (
      repository_id,
      issue_number,
      title,
      body,
      state,
      author,
      created_at_github,
      updated_at_github,
      url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (repository_id, issue_number)
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
    issue.repositoryId,
    issue.issueNumber,
    issue.title,
    issue.body,
    issue.state,
    issue.author,
    issue.createdAt,
    issue.updatedAt,
    issue.url,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const saveIssues = async (issues: IssueData[]) => {
  const savedIssues = [];

  for (const issue of issues) {
    const savedIssue = await saveIssue(issue);
    savedIssues.push(savedIssue);
  }

  return savedIssues;
};