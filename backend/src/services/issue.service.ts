import { getIssues } from "../github/github.issues";
import { findRepositoryByFullName } from "../repositories/repository.repository";
import { saveIssues } from "../repositories/issue.repository";

export const processIssues = async (
  owner: string,
  repo: string
) => {
  const fullName = `${owner}/${repo}`;

  const dbRepository = await findRepositoryByFullName(fullName);

  if (!dbRepository) {
    throw new Error(
      "Repository not found in database. Please fetch the repository first."
    );
  }

  const issues = await getIssues(owner, repo);

  const issueData = issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      repositoryId: dbRepository.id,
      issueNumber: issue.number,
      title: issue.title,
      body: issue.body ?? null,
      state: issue.state,
      author: issue.user?.login ?? "Unknown",
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      url: issue.html_url,
    }));

  return await saveIssues(issueData);
};