import api from "./api";

export const getProjectUnderstanding =
  async (
    owner: string,
    repo: string
  ) => {
    const response = await api.get(
      `/project-understanding/${owner}/${repo}`
    );

    return response.data;
  };