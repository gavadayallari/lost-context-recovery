import { pool } from "../config/database";

interface CommitRow {
  message: string;
  author: string | null;
  commit_date: Date | string | null;
  url?: string | null;
}

interface IssueRow {
  issue_number: number;
  title: string;
  body?: string | null;
  state: string;
  author: string | null;
  created_at_github?: Date | string | null;
  updated_at_github?: Date | string | null;
  url?: string | null;
}

interface PullRequestRow {
  pr_number: number;
  title: string;
  body?: string | null;
  state: string;
  author: string | null;
  created_at_github?: Date | string | null;
  updated_at_github?: Date | string | null;
  url?: string | null;
}

export const getProjectUnderstanding = async (
  owner: string,
  repo: string
) => {
  const fullName = `${owner}/${repo}`;

  const repositoryResult = await pool.query(
    `
    SELECT
      id,
      name,
      full_name,
      description,
      language,
      stars,
      forks
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

  const commitsResult = await pool.query(
    `
    SELECT
      message,
      author,
      commit_date
    FROM commits
    WHERE repository_id = $1::UUID
    ORDER BY commit_date DESC NULLS LAST
    LIMIT 10;
    `,
    [repositoryId]
  );

  const issuesResult = await pool.query(
    `
    SELECT
      issue_number,
      title,
      state
    FROM issues
    WHERE repository_id = $1::UUID
    ORDER BY issue_number DESC;
    `,
    [repositoryId]
  );

  const pullRequestsResult = await pool.query(
    `
    SELECT
      pr_number,
      title,
      state
    FROM pull_requests
    WHERE repository_id = $1::UUID
    ORDER BY pr_number DESC;
    `,
    [repositoryId]
  );

  const documentsResult = await pool.query(
    `
    SELECT
      name,
      content,
      path,
      file_type
    FROM documents
    WHERE repository_id = $1::UUID
    ORDER BY path;
    `,
    [repositoryId]
  );

  const summaryResult = await pool.query(
    `
    SELECT summary, structure
    FROM repository_summaries
    WHERE repository_id = $1::UUID
    LIMIT 1;
    `,
    [repositoryId]
  );

  const readmeDoc = documentsResult.rows.find((d: any) => d.name.toLowerCase().includes("readme"));
  const readmeContent = readmeDoc?.content ?? "";
  
  const codebaseSummary = summaryResult.rows[0]?.summary ?? null;
  const codebaseStructure = summaryResult.rows[0]?.structure ?? null;

  const commitMessages = commitsResult.rows
    .map((commit: CommitRow) => commit.message)
    .join(" ");

  const understanding = {
    projectName: repository.name,

    repository: repository.full_name,

    purpose:
      repository.description ??
      "Project purpose is not described in repository metadata.",

    technology:
      repository.language ?? "Technology not identified.",

    features: extractFeatures(readmeContent),

    developmentHistory: commitsResult.rows.map(
      (commit: CommitRow) => ({
        message: commit.message,
        author: commit.author,
        date: commit.commit_date,
      })
    ),

    issueSummary: {
      total: issuesResult.rows.length,
      open: issuesResult.rows.filter(
        (issue: IssueRow) => issue.state === "open"
      ).length,
      closed: issuesResult.rows.filter(
        (issue: IssueRow) => issue.state === "closed"
      ).length,
    },

    pullRequestSummary: {
      total: pullRequestsResult.rows.length,
      open: pullRequestsResult.rows.filter(
        (pullRequest: PullRequestRow) =>
          pullRequest.state === "open"
      ).length,
      closed: pullRequestsResult.rows.filter(
        (pullRequest: PullRequestRow) =>
          pullRequest.state === "closed"
      ).length,
    },

    recentActivity:
      commitMessages || "No commit activity found.",

    readmeAvailable: Boolean(readmeContent),
    
    codebaseSummary,
    codebaseStructure,
  };

  return understanding;
};

const extractFeatures = (readme: string) => {
  if (!readme) {
    return [];
  }

  const lines = readme
    .split("\n")
    .map((line) => line.trim());

  return lines
    .filter(
      (line) =>
        line.startsWith("-") ||
        line.startsWith("*")
    )
    .map((line) =>
      line
        .replace(/^[-*]\s*/, "")
        .trim()
    )
    .slice(0, 15);
};