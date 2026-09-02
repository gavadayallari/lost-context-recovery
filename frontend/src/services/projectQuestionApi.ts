import api from "./api";

export const askProjectQuestion = async (
  owner: string,
  repo: string,
  question: string
) => {
  const response = await api.post(
    `/project-question/${owner}/${repo}`,
    {
      question,
    }
  );

  return response.data;
};