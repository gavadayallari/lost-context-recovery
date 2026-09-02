import api from "./api";

export const getRepositories = async () => {
  const response = await api.get(
    "/repository-list"
  );

  return response.data;
};