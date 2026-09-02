import { getRepository } from "../github/github.client";
import { parseGitHubUrl } from "../github/github.utils";
import { saveRepository } from "../repositories/repository.repository";

export const processRepository = async (repoUrl: string) => {
  const { owner, repo } = parseGitHubUrl(repoUrl);

  const repository = await getRepository(owner, repo);

  const repositoryData = {
    owner,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description,
    url: repository.html_url,
    language: repository.language,
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    isPrivate: repository.private,
  };

  const savedRepository = await saveRepository(repositoryData);

  return savedRepository;
};