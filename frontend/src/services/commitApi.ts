import api from "./api";

export const getRepositoryCommits = async (
  owner: string,
  repo: string
) => {
  const response = await api.get(
    `/commits/${owner}/${repo}`
  );

  return response.data;
};