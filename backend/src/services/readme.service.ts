import { getReadme } from "../github/github.readme";
import { findRepositoryByFullName } from "../repositories/repository.repository";
import { saveDocument } from "../repositories/document.repository";

export const processReadme = async (
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

  try {
    const readme = await getReadme(owner, repo);

    const content = Buffer.from(
      readme.content,
      "base64"
    ).toString("utf-8");

    const document = {
      repositoryId: String(dbRepository.id),
      name: String(readme.name),
      path: String(readme.path),
      content,
      url: String(readme.html_url),
    };

    return await saveDocument(document);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (message.includes("Not Found") || message.includes("Private repository access is not available")) {
      console.warn(
        `README not found for ${fullName}. Continuing sync.`
      );

      return null;
    }

    throw error;
  }
};