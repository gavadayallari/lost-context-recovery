import { pool } from "../config/database";

interface DocumentRow {
  name: string;
  path: string;
  content: string | null;
}

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

export const answerProjectQuestion = async (
  owner: string,
  repo: string,
  question: string
) => {
  const fullName = `${owner}/${repo}`;

  // =================================================
  // Repository
  // =================================================

  const repositoryResult = await pool.query(
    `
    SELECT
      id,
      name,
      full_name,
      description,
      language
    FROM repositories
    WHERE LOWER(full_name) = LOWER($1)
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

  const repositoryId = repository.id as string;

  // =================================================
  // Commits
  // =================================================

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

  // =================================================
  // Issues
  // =================================================

  const issuesResult = await pool.query(
    `
    SELECT
      issue_number,
      title,
      state,
      author
    FROM issues
    WHERE repository_id = $1::UUID
    ORDER BY issue_number DESC;
    `,
    [repositoryId]
  );

  // =================================================
  // Pull Requests
  // =================================================

  const pullRequestsResult = await pool.query(
    `
    SELECT
      pr_number,
      title,
      state,
      author
    FROM pull_requests
    WHERE repository_id = $1::UUID
    ORDER BY pr_number DESC;
    `,
    [repositoryId]
  );

  // =================================================
  // README / Documents
  // =================================================

  const documentsResult = await pool.query(
    `
    SELECT
      name,
      path,
      content
    FROM documents
    WHERE repository_id = $1::UUID
    ORDER BY path ASC;
    `,
    [repositoryId]
  );

  const readmeDocument = documentsResult.rows.find(
    (document: DocumentRow) =>
      typeof document.content === "string" &&
      document.content.trim().length > 0
  );

  const readmeContent =
    readmeDocument?.content ?? "";

  const hasReadme =
    readmeContent.trim().length > 0;

  // =================================================
  // Normalize Question
  // =================================================

  const normalizedQuestion = question
    .toLowerCase()
    .trim();

  // =================================================
  // 1. WHAT IS THIS PROJECT?
  // =================================================

  if (
    normalizedQuestion.includes("what") &&
    normalizedQuestion.includes("project")
  ) {
    // First priority: repository description
    if (
      typeof repository.description === "string" &&
      repository.description.trim()
    ) {
      return {
        answer: repository.description,
        source: "repository",
      };
    }

    // Second priority: README
    if (hasReadme) {
      const readmeSummary = readmeContent
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .slice(0, 12)
        .join("\n");

      return {
        answer:
          readmeSummary ||
          "No project description is available.",
        source: "README",
      };
    }

    // No description and no README
    return {
      answer:
        "No project description or README is available for this repository.",
      source: "repository",
    };
  }

  // =================================================
  // 2. TECHNOLOGY
  // =================================================

  if (
    normalizedQuestion.includes("technology") ||
    normalizedQuestion.includes("technologies") ||
    normalizedQuestion.includes("tech stack") ||
    normalizedQuestion.includes("technology stack") ||
    normalizedQuestion.includes("language")
  ) {
    return {
      answer: `Primary language: ${
        repository.language ?? "Unknown"
      }`,
      source: "repository",
    };
  }

  // =================================================
  // 3. FEATURES
  // =================================================

  if (
    normalizedQuestion.includes("feature") ||
    normalizedQuestion.includes("features")
  ) {
    if (!hasReadme) {
      return {
        answer:
          "README is not available for this repository.",
        source: "README",
      };
    }

    const featureLines = readmeContent
      .split("\n")
      .map((line: string) => line.trim())
      .filter(
        (line: string) =>
          line.startsWith("-") ||
          line.startsWith("*") ||
          line.startsWith("•")
      )
      .map((line: string) =>
        line
          .replace(/^[-*•]\s*/, "")
          .trim()
      )
      .filter((line: string) => line.length > 0)
      .slice(0, 10);

    return {
      answer:
        featureLines.length > 0
          ? featureLines.join("\n")
          : "No feature list could be extracted from the README.",
      source: "README",
    };
  }

  // =================================================
  // 4. RECENT CHANGES
  // =================================================

  if (
    normalizedQuestion.includes("recent") ||
    normalizedQuestion.includes("latest") ||
    normalizedQuestion.includes("change") ||
    normalizedQuestion.includes("changes") ||
    normalizedQuestion.includes("recently")
  ) {
    const latestCommits = commitsResult.rows
      .slice(0, 5)
      .map(
        (commit: CommitRow) =>
          `Commit: ${commit.message} by ${
            commit.author ?? "Unknown"
          }`
      );

    const recentIssues = issuesResult.rows
      .slice(0, 5)
      .map(
        (issue: IssueRow) =>
          `Issue #${issue.issue_number}: ${issue.title} (${issue.state})`
      );

    const recentPullRequests =
      pullRequestsResult.rows
        .slice(0, 5)
        .map(
          (pullRequest: PullRequestRow) =>
            `PR #${pullRequest.pr_number}: ${pullRequest.title} (${pullRequest.state})`
        );

    const sections = [
      ...latestCommits,
      ...recentIssues,
      ...recentPullRequests,
    ];

    return {
      answer:
        sections.length > 0
          ? sections.join("\n")
          : "No recent project activity was found.",
      source:
        "commits + issues + pull_requests",
    };
  }

  // =================================================
  // 5. ISSUES
  // =================================================

  if (
    normalizedQuestion.includes("issue") ||
    normalizedQuestion.includes("issues")
  ) {
    const openIssues = issuesResult.rows.filter(
      (issue: IssueRow) =>
        String(issue.state).toLowerCase() === "open"
    ).length;

    const closedIssues = issuesResult.rows.filter(
      (issue: IssueRow) =>
        String(issue.state).toLowerCase() === "closed"
    ).length;

    return {
      answer:
        `This repository has ${issuesResult.rows.length} issue(s).\n` +
        `Open: ${openIssues}\n` +
        `Closed: ${closedIssues}`,
      source: "issues",
    };
  }

  // =================================================
  // 6. PULL REQUESTS
  // =================================================

  if (
    normalizedQuestion.includes("pull request") ||
    normalizedQuestion.includes("pull requests") ||
    normalizedQuestion.includes("pullrequest") ||
    normalizedQuestion === "pr" ||
    normalizedQuestion.includes("prs")
  ) {
    const openPullRequests =
      pullRequestsResult.rows.filter(
        (pullRequest: PullRequestRow) =>
          String(pullRequest.state).toLowerCase() ===
          "open"
      ).length;

    const closedPullRequests =
      pullRequestsResult.rows.filter(
        (pullRequest: PullRequestRow) =>
          String(pullRequest.state).toLowerCase() ===
          "closed"
      ).length;

    return {
      answer:
        `This repository has ${pullRequestsResult.rows.length} pull request(s).\n` +
        `Open: ${openPullRequests}\n` +
        `Closed: ${closedPullRequests}`,
      source: "pull_requests",
    };
  }

  // =================================================
  // 7. COMMITS
  // =================================================

  if (
    normalizedQuestion.includes("commit") ||
    normalizedQuestion.includes("commits")
  ) {
    const latestCommit =
      commitsResult.rows[0];

    if (!latestCommit) {
      return {
        answer: "No commits found.",
        source: "commits",
      };
    }

    return {
      answer:
        `Latest commit: ${latestCommit.message}\n` +
        `Author: ${
          latestCommit.author ?? "Unknown"
        }\n` +
        `Date: ${
          latestCommit.commit_date ?? "Unknown"
        }`,
      source: "commits",
    };
  }

  // =================================================
  // 8. README
  // =================================================

  if (
    normalizedQuestion.includes("readme") ||
    normalizedQuestion.includes("documentation") ||
    normalizedQuestion.includes("docs")
  ) {
    if (!hasReadme) {
      return {
        answer:
          "README is not available for this repository.",
        source: "README",
      };
    }

    return {
      answer: readmeContent
        .split("\n")
        .slice(0, 30)
        .join("\n"),
      source: "README",
    };
  }

  // =================================================
  // 9. GENERAL PROJECT SUMMARY
  // =================================================

  if (
    normalizedQuestion.includes("summary") ||
    normalizedQuestion.includes("overview")
  ) {
    const summaryParts: string[] = [];

    if (repository.description) {
      summaryParts.push(
        `Description: ${repository.description}`
      );
    }

    summaryParts.push(
      `Language: ${
        repository.language ?? "Unknown"
      }`
    );

    summaryParts.push(
      `Commits: ${commitsResult.rows.length}`
    );

    summaryParts.push(
      `Issues: ${issuesResult.rows.length}`
    );

    summaryParts.push(
      `Pull Requests: ${pullRequestsResult.rows.length}`
    );

    summaryParts.push(
      `README: ${
        hasReadme ? "Available" : "Not available"
      }`
    );

    return {
      answer: summaryParts.join("\n"),
      source:
        "repository + commits + issues + pull_requests + README",
    };
  }

  // =================================================
  // 10. FALLBACK
  // =================================================

  return {
    answer:
      "I could not find a direct answer in the stored project context. Try asking about the project, technology, features, recent changes, commits, issues, pull requests, README, or project summary.",
    source: "project-context",
  };
};