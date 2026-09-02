import api from "./api";

export const getRepositoryIssues = async (
  owner: string,
  repo: string
) => {
  const response = await api.get(
    `/issues/${owner}/${repo}`
  );

  return response.data;
};