import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const getReadme = async (
  owner: string,
  repo: string
) => {
  const response = await octokit.rest.repos.getReadme({
    owner,
    repo,
  });

  return response.data;
};