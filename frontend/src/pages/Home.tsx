import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSyncStatus, startRepositorySync} from "../services/syncApi";
import { parseGitHubUrl } from "../utils/github";

const Home = () => {
  const navigate = useNavigate();

  const [repoUrl, setRepoUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);

  const [status, setStatus] = useState<
    "idle" | "pending" | "running" | "completed" | "failed"
  >("idle");

  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setError(null);

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    const parsedRepo = parseGitHubUrl(repoUrl);

    if (!parsedRepo) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      setStatus("pending");

      const response = await startRepositorySync(repoUrl);

      const jobId = response.data.jobId;

      await pollSyncStatus(
        jobId,
        parsedRepo.owner,
        parsedRepo.repo
      );
    } catch (error) {
      console.error(error);

      setStatus("failed");
      setError("Failed to start repository analysis.");
      setLoading(false);
    }
  };

  const pollSyncStatus = async (
    jobId: string,
    owner: string,
    repo: string
  ) => {
    const maxAttempts = 60;
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        setStatus("failed");
        setError("Repository analysis timed out.");
        setLoading(false);
        return;
      }

      attempts++;

      const response = await getSyncStatus(jobId);

      const job = response.data;

      setProgress(job.progress ?? 0);
      setStatus(job.status);

      if (job.status === "completed") {
        setProgress(100);
        setLoading(false);

        navigate(
          `/dashboard/${encodeURIComponent(
            owner
          )}/${encodeURIComponent(repo)}`
        );

        return;
      }

      if (job.status === "failed") {
        setError(
          job.error_message ??
            "Repository analysis failed."
        );

        setLoading(false);
        return;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      await checkStatus();
    };

    await checkStatus();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="w-full max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-400">
              Lost Context Recovery
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-tight">
              Understand any GitHub project
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              Enter a GitHub repository URL and recover
              its documentation, commits, issues,
              pull requests, and project context.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <label className="block text-sm font-medium text-slate-300">
              GitHub Repository URL
            </label>

            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input
                value={repoUrl}
                onChange={(event) =>
                  setRepoUrl(event.target.value)
                }
                disabled={loading}
                type="url"
                placeholder="https://github.com/owner/repository"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-50"
              />

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze Repository"}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {loading && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {status === "pending"
                      ? "Preparing analysis..."
                      : "Analyzing repository..."}
                  </span>

                  <span className="font-medium text-white">
                    {progress}%
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="mt-4 flex justify-between text-xs text-slate-500">
                  <span>Repository</span>
                  <span>Commits</span>
                  <span>Issues</span>
                  <span>Pull Requests</span>
                  <span>README</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-blue-400">01</p>

              <h3 className="mt-2 font-semibold">
                Connect Repository
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Enter a public GitHub repository URL.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-blue-400">02</p>

              <h3 className="mt-2 font-semibold">
                Recover Context
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Sync README, commits, issues, and PRs.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-blue-400">03</p>

              <h3 className="mt-2 font-semibold">
                Explore Project
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Understand the project from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;