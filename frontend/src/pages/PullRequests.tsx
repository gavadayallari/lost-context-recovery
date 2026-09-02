import { useEffect, useState } from "react";
import {
  getRepositoryPullRequests,
} from "../services/pullRequestApi";
import { useParams, Link } from "react-router-dom";

type PullRequest = {
  id: string;
  repository_id: string;
  pr_number: number;
  title: string;
  body: string | null;
  state: string;
  author: string | null;
  created_at_github: string | null;
  updated_at_github: string | null;
  url: string;
};

const PullRequests = () => {
  const { owner, repo } = useParams<{
    owner: string;
    repo: string;
  }>();

  const [pullRequests, setPullRequests] = useState<
    PullRequest[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadPullRequests = async () => {
      if (!owner || !repo) {
        setError("Repository information is missing");
        setLoading(false);
        return;
      }

      try {
        const response =
          await getRepositoryPullRequests(
            owner,
            repo
          );

        setPullRequests(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load pull requests");
      } finally {
        setLoading(false);
      }
    };

    loadPullRequests();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading pull requests...
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
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="mb-6">
        <Link
          to={`/dashboard/${owner}/${repo}`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
        >
          ← Back to Dashboard
        </Link>
      </div>
      <div className="max-w-5xl mx-auto">
        <p className="text-sm text-slate-400">
          Code Review History
        </p>

        <div className="flex items-center justify-between gap-4 mt-2">
          <h1 className="text-3xl font-bold">
            Pull Requests
          </h1>

          <span className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-sm text-slate-400">
            {pullRequests.length} total
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {owner}/{repo}
        </p>

        <div className="mt-8 space-y-4">
          {pullRequests.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="text-lg font-medium text-white">
                No pull requests found
              </p>

              <p className="mt-2 text-sm text-slate-400">
                This repository currently has no saved
                pull requests.
              </p>
            </div>
          ) : (
            pullRequests.map((pullRequest) => (
              <div
                key={`${pullRequest.pr_number}-${pullRequest.repository_id}`}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                          #{pullRequest.pr_number}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            pullRequest.state === "open"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {pullRequest.state}
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-semibold">
                        {pullRequest.title}
                      </h2>
                    </div>

                    <a
                      href={pullRequest.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      View on GitHub →
                    </a>
                  </div>

                  {pullRequest.body && (
                    <p className="text-sm leading-6 text-slate-300 whitespace-pre-wrap">
                      {pullRequest.body}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-5 text-sm text-slate-500">
                    <span>
                      Author:{" "}
                      {pullRequest.author ?? "Unknown"}
                    </span>

                    <span>
                      Created:{" "}
                      {pullRequest.created_at_github
                        ? new Date(
                            pullRequest.created_at_github
                          ).toLocaleString()
                        : "Unknown"}
                    </span>

                    <span>
                      Updated:{" "}
                      {pullRequest.updated_at_github
                        ? new Date(
                            pullRequest.updated_at_github
                          ).toLocaleString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PullRequests;