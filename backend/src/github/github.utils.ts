export const parseGitHubUrl = (repoUrl: string) => {
  try {
    const url = new URL(repoUrl);

    if (url.hostname !== "github.com") {
      throw new Error("Only GitHub repository URLs are supported");
    }

    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    if (parts.length < 2) {
      throw new Error("Invalid GitHub repository URL");
    }

    const owner = parts[0];
    const repo = parts[1];

    if (!owner || !repo) {
      throw new Error("Invalid GitHub repository URL");
    }

    return {
      owner,
      repo: repo.replace(/\.git$/, ""),
    };
  } catch {
    throw new Error("Invalid GitHub repository URL");
  }
};