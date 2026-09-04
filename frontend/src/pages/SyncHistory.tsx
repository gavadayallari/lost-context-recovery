import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getSyncHistory } from "../services/syncHistoryApi";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

type SyncJob = {
  id: string;
  repository_id: string;
  status: string;
  progress: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  full_name: string;
};

const SyncHistory = () => {
  const { owner, repo } = useParams<{
    owner: string;
    repo: string;
  }>();

  const [history, setHistory] =
    useState<SyncJob[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!owner || !repo) {
        setError(
          "Repository information is missing."
        );
        setLoading(false);
        return;
      }

      try {
        const response =
          await getSyncHistory(
            owner,
            repo
          );

        setHistory(response.data);
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load sync history"
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading sync history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Repository
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Sync History
            </h1>

            <p className="mt-2 text-slate-500">
              {owner}/{repo}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {history.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
              <h2 className="text-lg font-semibold">
                No sync history
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                This repository has not been synced yet.
              </p>
            </div>
          ) : (
            history.map((job) => {
              const isCompleted =
                job.status === "completed";

              const isFailed =
                job.status === "failed";

              return (
                <div
                  key={job.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        Sync Job
                      </p>

                      <p className="mt-1 font-mono text-xs text-slate-600">
                        {job.id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isCompleted
                          ? "bg-green-500/10 text-green-400"
                          : isFailed
                          ? "bg-red-500/10 text-red-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Progress
                      </span>

                      <span className="font-medium">
                        {job.progress}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted
                            ? "bg-green-500"
                            : isFailed
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${job.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">
                        Created
                      </p>

                      <p className="mt-1 text-slate-300">
                        {new Date(
                          job.created_at
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">
                        Started
                      </p>

                      <p className="mt-1 text-slate-300">
                        {job.started_at
                          ? new Date(
                              job.started_at
                            ).toLocaleString()
                          : "Not started"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">
                        Completed
                      </p>

                      <p className="mt-1 text-slate-300">
                        {job.completed_at
                          ? new Date(
                              job.completed_at
                            ).toLocaleString()
                          : "Not completed"}
                      </p>
                    </div>
                  </div>

                  {job.error_message && (
                    <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                      {job.error_message}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SyncHistory;