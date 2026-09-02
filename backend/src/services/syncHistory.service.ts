import {
  getSyncHistoryByRepositoryFullName,
} from "../repositories/syncHistory.repository";

export const getRepositorySyncHistory = async (
  owner: string,
  repo: string
) => {
  const fullName = `${owner}/${repo}`;

  return await getSyncHistoryByRepositoryFullName(
    fullName
  );
};