import { processRepository } from "./repository.service";
import { createSyncJob, getSyncJobById } from "../repositories/syncJob.repository";
import { runSyncWorker } from "../workers/sync.worker";

export const startRepositorySync = async (
  repoUrl: string
) => {
  const repository =
    await processRepository(repoUrl);

  const job = await createSyncJob({
    repositoryId: repository.id,
  });

  setImmediate(() => {
    runSyncWorker(
      job.id,
      repoUrl
    );
  });

  return {
    jobId: job.id,
    status: job.status,
    progress: job.progress,
  };
};

export const getSyncStatus = async (
  jobId: string
) => {
  return await getSyncJobById(jobId);
};