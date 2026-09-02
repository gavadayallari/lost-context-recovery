import api from "./api";

export const getProjectTimeline = async (
  owner: string,
  repo: string
) => {
  const response = await api.get(
    `/timeline/${owner}/${repo}`
  );

  return response.data;
};