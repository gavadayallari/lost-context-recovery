import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectTimeline } from "../services/timelineApi";

type TimelineItem = {
  event_type: "commit" | "issue" | "pull_request";
  reference: string;
  title: string;
  author: string | null;
  event_date: string | null;
  url: string;
};

const Timeline = () => {
  const { owner, repo } = useParams<{
    owner: string;
    repo: string;
  }>();

  const [timeline, setTimeline] = useState<TimelineItem[]>(
    []
  );

  const [repository, setRepository] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadTimeline = async () => {
      if (!owner || !repo) {
        setError("Repository information is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await getProjectTimeline(
          owner,
          repo
        );

        setRepository(response.data.repository);
        setTimeline(response.data.timeline);
      } catch (error) {
        console.error(error);
        setError(
          "Failed to load project timeline"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading timeline...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mb-6">
        <Link
          to={`/dashboard/${owner}/${repo}`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
        >
          ← Back to Dashboard
        </Link>
      </div>
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-slate-400">
          Project Timeline
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {repository || `${owner}/${repo}`}
        </h1>

        <div className="mt-10">
          {timeline.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No project activity found.
            </div>
          ) : (
            <div className="relative border-l border-slate-700 pl-8">
              {timeline.map((item, index) => {
                const isCommit =
                  item.event_type === "commit";

                const isIssue =
                  item.event_type === "issue";

                return (
                  <div
                    key={`${item.event_type}-${item.reference}-${index}`}
                    className="relative mb-8"
                  >
                    <div className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 ring-4 ring-slate-950">
                      <div
                        className={`h-2 w-2 rounded-full ${isCommit
                          ? "bg-blue-400"
                          : isIssue
                            ? "bg-yellow-400"
                            : "bg-purple-400"
                          }`}
                      />
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${isCommit
                            ? "bg-blue-500/10 text-blue-400"
                            : isIssue
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-purple-500/10 text-purple-400"
                            }`}
                        >
                          {item.event_type
                            .replace("_", " ")
                            .toUpperCase()}
                        </span>

                        <span className="font-mono text-xs text-slate-500">
                          {item.reference}
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-semibold">
                        {item.title}
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                        <span>
                          Author:{" "}
                          {item.author ?? "Unknown"}
                        </span>

                        <span>
                          {item.event_date
                            ? new Date(
                              item.event_date
                            ).toLocaleString()
                            : "Unknown date"}
                        </span>
                      </div>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300"
                        >
                          View on GitHub →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;