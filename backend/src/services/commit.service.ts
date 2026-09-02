import { getCommits } from "../github/github.commits";
import { findRepositoryByFullName } from "../repositories/repository.repository";
import { saveCommits } from "../repositories/commit.repository";

export const processCommits = async (
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

  const commits = await getCommits(owner, repo);

  const commitData = commits.map((commit) => ({
    repositoryId: dbRepository.id,
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author?.name ?? "Unknown",
    date: commit.commit.author?.date ?? null,
    url: commit.html_url,
  }));

  const savedCommits = await saveCommits(commitData);

  return savedCommits;
};