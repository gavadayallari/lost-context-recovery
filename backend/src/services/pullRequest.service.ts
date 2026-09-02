import { getPullRequests } from "../github/github.pullRequests";
import { findRepositoryByFullName } from "../repositories/repository.repository";
import { savePullRequests } from "../repositories/pullRequest.repository";

export const processPullRequests = async (
  owner: string,
  repo: string
) => {
  const fullName = `${owner}/${repo}`;

  const dbRepository =
    await findRepositoryByFullName(fullName);

  if (!dbRepository) {
    throw new Error(
      "Repository not found in database. Please fetch the repository first."
    );
  }

  const pullRequests = await getPullRequests(
    owner,
    repo
  );

  const pullRequestData = pullRequests.map(
    (pullRequest) => ({
      repositoryId: dbRepository.id,
      prNumber: pullRequest.number,
      title: pullRequest.title,
      body: pullRequest.body,
      state: pullRequest.state,
      author:
        pullRequest.user?.login ?? "Unknown",
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
      url: pullRequest.html_url,
    })
  );

  return await savePullRequests(pullRequestData);
};