import api from "./api";

export const getRepositoryReadme = async (
  owner: string,
  repo: string
) => {
  const response = await api.get(
    `/readme/${owner}/${repo}`
  );

  return response.data;
};