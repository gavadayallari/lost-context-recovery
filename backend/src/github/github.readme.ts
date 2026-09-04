import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

import { handleGitHubError } from "./github.utils";

export const getReadme = async (
  owner: string,
  repo: string
) => {
  try {
    const response = await octokit.rest.repos.getReadme({
      owner,
      repo,
    });

    return response.data;
  } catch (error) {
    throw handleGitHubError(error);
  }
};