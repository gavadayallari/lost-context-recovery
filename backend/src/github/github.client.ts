import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

console.log(
  "GitHub token loaded:",
  process.env.GITHUB_TOKEN ? "YES" : "NO"
);

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

import { handleGitHubError } from "./github.utils";

export const getRepository = async (
  owner: string,
  repo: string
) => {
  try {
    const response = await octokit.rest.repos.get({
      owner,
      repo,
    });

    return response.data;
  } catch (error) {
    throw handleGitHubError(error);
  }
};