import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const getIssues = async (
  owner: string,
  repo: string
) => {
  const response = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "all",
    per_page: 20,
  });

  return response.data;
};