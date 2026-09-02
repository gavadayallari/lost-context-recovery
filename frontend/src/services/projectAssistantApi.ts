import api from "./api";

export const askProjectAssistant = async (
  owner: string,
  repo: string,
  question: string
) => {
  const response = await api.post(`/project-assistant/${owner}/${repo}`, {
    question,
  });

  return response.data;
};
