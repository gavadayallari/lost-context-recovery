import api from "./api";

export const getProjectOverview = async (
  owner: string,
  repo: string
) => {
  const response = await api.get(
    `/overview/${owner}/${repo}`
  );

  return response.data;
};