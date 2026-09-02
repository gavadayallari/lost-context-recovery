import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRepositoryCommits } from "../services/commitApi";

type Commit = {
  id: string;
  repository_id: string;
  sha: string;
  message: string;
  author: string | null;
  commit_date: string | null;
  url: string;
};

const Commits = () => {
  const { owner, repo } = useParams<{
    owner: string;
    repo: string;
  }>();

  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCommits = async () => {
      if (!owner || !repo) {
        setError("Repository information is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await getRepositoryCommits(
          owner,
          repo
        );

        setCommits(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load commits");
      } finally {
        setLoading(false);
      }
    };

    loadCommits();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading commits...
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
          Repository History
        </p>

        <h1 className="text-3xl font-bold mt-2">
          Commits
        </h1>

        <p className="text-slate-400 mt-2">
          {commits.length} commits found
        </p>

        <div className="mt-8 space-y-4">
          {commits.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No commits found.
            </div>
          ) : (
            commits.map((commit) => (
              <div
                key={commit.sha}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {commit.message}
                      </h2>

                      <p className="text-sm text-slate-400 mt-2">
                        Author:{" "}
                        {commit.author ?? "Unknown"}
                      </p>
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      {commit.sha.slice(0, 8)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>
                      {commit.commit_date
                        ? new Date(
                            commit.commit_date
                          ).toLocaleString()
                        : "Unknown date"}
                    </span>

                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      View on GitHub →
                    </a>
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

export default Commits;