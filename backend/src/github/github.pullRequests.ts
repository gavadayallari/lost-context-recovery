import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

import { handleGitHubError } from "./github.utils";

export const getPullRequests = async (
  owner: string,
  repo: string
) => {
  try {
    const response = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "all",
      per_page: 20,
    });

    return response.data;
  } catch (error) {
    throw handleGitHubError(error);
  }
};