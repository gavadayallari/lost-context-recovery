import api from "./api";

export const getSyncHistory = async (
  owner: string,
  repo: string
) => {
  const response = await api.get(
    `/sync-history/${owner}/${repo}`
  );

  return response.data;
};