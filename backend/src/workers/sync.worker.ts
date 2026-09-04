import { processRepository } from "../services/repository.service";
import { processCommits } from "../services/commit.service";
import { processIssues } from "../services/issue.service";
import { processPullRequests } from "../services/pullRequest.service";
import { processReadme } from "../services/readme.service";
import { updateSyncJob } from "../repositories/syncJob.repository";
import { syncRepositoryCode } from "../github/repositoryAnalyzer";
import { analyzeCodebase } from "../ai/codebaseAnalysis.service";

export const runSyncWorker = async (
  jobId: string,
  repoUrl: string
) => {
  try {
    await updateSyncJob(jobId, "running", 5);
    const repository = await processRepository(repoUrl);
    const owner = repository.owner;
    const repo = repository.name;
    const repositoryId = repository.id as string;

    await updateSyncJob(jobId, "running", 20);
    await processCommits(owner, repo);

    await updateSyncJob(jobId, "running", 35);
    await processIssues(owner, repo);

    await updateSyncJob(jobId, "running", 50);
    await processPullRequests(owner, repo);

    await updateSyncJob(jobId, "running", 60);
    const readme = await processReadme(owner, repo);
    if (!readme) {
      console.warn(`README not found for ${owner}/${repo}. Continuing sync...`);
    }

    await updateSyncJob(jobId, "running", 70);
    const syncStats = await syncRepositoryCode(owner, repo, repositoryId);

    await updateSyncJob(jobId, "running", 90);
    await analyzeCodebase(repositoryId, syncStats);

    await updateSyncJob(jobId, "completed", 100);
  } catch (error) {
    await updateSyncJob(
      jobId,
      "failed",
      0,
      error instanceof Error ? error.message : "Sync failed"
    );
  }
};