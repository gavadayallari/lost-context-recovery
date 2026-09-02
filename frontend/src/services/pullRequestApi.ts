import api from "./api";

export const getRepositoryPullRequests = async (
  owner: string,
  repo: string
) => {
  const response = await api.get(
    `/pull-requests/${owner}/${repo}`
  );

  return response.data;
};