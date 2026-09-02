import { getRepository } from "../github/github.client";
import { parseGitHubUrl } from "../github/github.utils";

export const processRepository = async (repoUrl: string) => {
  const { owner, repo } = parseGitHubUrl(repoUrl);

  const repository = await getRepository(owner, repo);

  return {
    owner,
    repo,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description,
    url: repository.html_url,
    language: repository.language,
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    isPrivate: repository.private,
  };
};