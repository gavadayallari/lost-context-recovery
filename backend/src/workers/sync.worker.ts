import { processRepository } from "../services/repository.service";
import { processCommits } from "../services/commit.service";
import { processIssues } from "../services/issue.service";
import {
  processPullRequests,
} from "../services/pullRequest.service";
import { processReadme } from "../services/readme.service";

import {
  updateSyncJob,
} from "../repositories/syncJob.repository";

export const runSyncWorker = async (
  jobId: string,
  repoUrl: string
) => {
  try {
    await updateSyncJob(
      jobId,
      "running",
      5
    );

    const repository =
      await processRepository(repoUrl);

    const owner = repository.owner;
    const repo = repository.name;

    await updateSyncJob(
      jobId,
      "running",
      20
    );

    await processCommits(owner, repo);

    await updateSyncJob(
      jobId,
      "running",
      40
    );

    await processIssues(owner, repo);

    await updateSyncJob(
      jobId,
      "running",
      60
    );

    await processPullRequests(
      owner,
      repo
    );

    await updateSyncJob(
      jobId,
      "running",
      80
    );

    // README is optional
    const readme = await processReadme(
      owner,
      repo
    );

    if (!readme) {
      console.warn(
        `README not found for ${owner}/${repo}. Continuing sync...`
      );
    }

    await updateSyncJob(
      jobId,
      "running",
      95
    );

    await updateSyncJob(
      jobId,
      "completed",
      100
    );
  } catch (error) {
    await updateSyncJob(
      jobId,
      "failed",
      0,
      error instanceof Error
        ? error.message
        : "Sync failed"
    );
  }
};