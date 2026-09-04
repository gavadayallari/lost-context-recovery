import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { getProjectOverview } from "../services/overviewApi";
import { getProjectUnderstanding } from "../services/projectUnderstandingApi";
import { getRepositoryCommits } from "../services/commitApi";
import RepositorySwitcher from "../components/repository/RepositorySwitcher";

import { CommitActivityChart } from "../components/charts/CommitActivityChart";
import { IssueStatusChart } from "../components/charts/IssueStatusChart";
import { PullRequestStatusChart } from "../components/charts/PullRequestStatusChart";
import { ProjectActivityChart } from "../components/charts/ProjectActivityChart";
import { NewDeveloperBrief } from "../components/dashboard/NewDeveloperBrief";

type ProjectOverview = {
  project: {
    id: string;
    name: string;
    fullName: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    isPrivate: boolean;
    url: string;
  };

  activity: {
    latestCommit: {
      sha: string;
      message: string;
      author: string | null;
      commit_date: string | null;
    } | null;
  };

  counts: {
    commits: number;
    issues: number;
    pullRequests: number;
    documents: number;
  };

  hasReadme: boolean;
};

type ProjectUnderstanding = {
  projectName: string;
  repository: string;
  purpose: string;
  technology: string;
  features: string[];

  developmentHistory: Array<{
    message: string;
    author: string | null;
    date: string | null;
  }>;

  issueSummary: {
    total: number;
    open: number;
    closed: number;
  };

  pullRequestSummary: {
    total: number;
    open: number;
    closed: number;
  };

  recentActivity: string;
  readmeAvailable: boolean;
  codebaseSummary?: string;
  codebaseStructure?: {
    projectType: string;
    languages: string[];
    frameworks: string[];
    entryPoints: string[];
    frontend: boolean;
    backend: boolean;
    database: boolean;
    testing: boolean;
    docker: boolean;
    totalFiles: number;
  };
};

const Dashboard = () => {
  const { owner, repo } = useParams<{
    owner: string;
    repo: string;
  }>();

  const [data, setData] =
    useState<ProjectOverview | null>(null);

  const [understanding, setUnderstanding] =
    useState<ProjectUnderstanding | null>(null);

  const [commits, setCommits] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!owner || !repo) {
        setError(
          "Repository information is missing."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          overviewResponse,
          understandingResponse,
          commitsResponse,
        ] = await Promise.all([
          getProjectOverview(owner, repo),
          getProjectUnderstanding(owner, repo),
          getRepositoryCommits(owner, repo),
        ]);

        setData(overviewResponse.data);

        setUnderstanding(
          understandingResponse.data
        );

        setCommits(commitsResponse.data || []);
      } catch (error) {
        console.error(error);
        setError(
          "Failed to load project data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading project...
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

  if (!data || !owner || !repo) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        No project data found.
      </div>
    );
  }

  const stats = [
    {
      label: "Commits",
      value: data.counts.commits,
    },
    {
      label: "Issues",
      value: data.counts.issues,
    },
    {
      label: "Pull Requests",
      value: data.counts.pullRequests,
    },
    {
      label: "Documents",
      value: data.counts.documents,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-slate-800 bg-slate-900 p-6 md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold">
            Lost Context
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Project Recovery System
          </p>
        </div>

        <nav className="space-y-2">
          <Link
            to={`/dashboard/${owner}/${repo}`}
            className="block w-full rounded-lg bg-slate-800 px-4 py-3 text-white"
          >
            Overview
          </Link>

          <Link
            to={`/dashboard/${owner}/${repo}/timeline`}
            className="block w-full rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Timeline
          </Link>

          <Link
            to={`/dashboard/${owner}/${repo}/commits`}
            className="block w-full rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Commits
          </Link>

          <Link
            to={`/dashboard/${owner}/${repo}/issues`}
            className="block w-full rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Issues
          </Link>

          <Link
            to={`/dashboard/${owner}/${repo}/pull-requests`}
            className="block w-full rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Pull Requests
          </Link>

          <Link
            to={`/dashboard/${owner}/${repo}/readme`}
            className="block w-full rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            README
          </Link>

          <Link
            to={`/dashboard/${owner}/${repo}/ask`}
            className="block w-full rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Ask Project
          </Link>

          <Link
            to={`/dashboard/${owner}/${repo}/sync-history`}
            className="block w-full rounded-lg px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Sync History
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Repository
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {data.project.name}
              </h2>

              <p className="mt-2 text-slate-400">
                {data.project.fullName}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <RepositorySwitcher />

              <a
                href={data.project.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-slate-300">
            {data.project.description ??
              "No description available"}
          </p>
        </div>

        {/* Technology */}
        <div className="mb-8">
          <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
            {data.project.language ?? "Unknown"}
          </span>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Analytics */}
        {understanding && (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CommitActivityChart commits={commits} />
            <ProjectActivityChart
              commits={data.counts.commits}
              issues={data.counts.issues}
              pullRequests={data.counts.pullRequests}
              documents={data.counts.documents}
            />
            <IssueStatusChart
              open={understanding.issueSummary.open}
              closed={understanding.issueSummary.closed}
            />
            <PullRequestStatusChart
              open={understanding.pullRequestSummary.open}
              closed={understanding.pullRequestSummary.closed}
            />
          </div>
        )}

        {/* Repository Information + Latest Commit */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              Repository Information
            </h3>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">
                  Stars
                </span>

                <span>
                  {data.project.stars}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Forks
                </span>

                <span>
                  {data.project.forks}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Visibility
                </span>

                <span>
                  {data.project.isPrivate
                    ? "Private"
                    : "Public"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  README
                </span>

                <span>
                  {data.hasReadme
                    ? "Available"
                    : "Not available"}
                </span>
              </div>
            </div>
          </section>

          {/* Latest Commit */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              Latest Commit
            </h3>

            {data.activity.latestCommit ? (
              <div className="mt-5">
                <p className="font-medium text-white">
                  {
                    data.activity.latestCommit
                      .message
                  }
                </p>

                <p className="mt-3 text-sm text-slate-400">
                  Author:{" "}
                  {data.activity.latestCommit
                    .author ?? "Unknown"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {
                    data.activity.latestCommit
                      .commit_date
                  }
                </p>
              </div>
            ) : (
              <p className="mt-5 text-slate-400">
                No commits found.
              </p>
            )}
          </section>
        </div>

        {/* New Developer Brief */}
        {understanding && (
          <NewDeveloperBrief owner={owner} repo={repo} understanding={understanding} />
        )}

        {/* Project Understanding */}
        {understanding && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <p className="text-sm text-blue-400">
              Project Context
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              What is this project?
            </h2>

            <p className="mt-4 max-w-4xl leading-7 text-slate-300">
              {understanding.purpose}
            </p>

            {/* Technology + README */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold">
                  Technology
                </h3>

                <p className="mt-2 text-slate-400">
                  {understanding.technology}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  README
                </h3>

                <p className="mt-2 text-slate-400">
                  {understanding.readmeAvailable
                    ? "Available"
                    : "Not available"}
                </p>
              </div>
            </div>
            
            {understanding.codebaseSummary && (
              <div className="mt-8 rounded-xl border border-slate-700 bg-slate-900/50 p-6">
                <h3 className="text-lg font-semibold text-blue-400">Codebase Summary</h3>
                <p className="mt-3 text-slate-300 whitespace-pre-wrap leading-7">
                  {understanding.codebaseSummary}
                </p>
              </div>
            )}
            
            {understanding.codebaseStructure && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold">Project Architecture</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <span className="text-xs text-slate-500 block">Project Type</span>
                    <span className="font-medium">{understanding.codebaseStructure.projectType}</span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <span className="text-xs text-slate-500 block">Languages</span>
                    <span className="font-medium">{understanding.codebaseStructure.languages.join(", ") || "None"}</span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <span className="text-xs text-slate-500 block">Frameworks</span>
                    <span className="font-medium">{understanding.codebaseStructure.frameworks.join(", ") || "None"}</span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <span className="text-xs text-slate-500 block">Source Files Indexed</span>
                    <span className="font-medium">{understanding.codebaseStructure.totalFiles}</span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <span className="text-xs text-slate-500 block">Components</span>
                    <div className="flex gap-2 mt-1">
                      {understanding.codebaseStructure.frontend && <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">Frontend</span>}
                      {understanding.codebaseStructure.backend && <span className="bg-green-900 text-green-200 text-xs px-2 py-1 rounded">Backend</span>}
                      {understanding.codebaseStructure.database && <span className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded">Database</span>}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <span className="text-xs text-slate-500 block">Infrastructure</span>
                    <div className="flex gap-2 mt-1">
                      {understanding.codebaseStructure.docker && <span className="bg-cyan-900 text-cyan-200 text-xs px-2 py-1 rounded">Docker</span>}
                      {understanding.codebaseStructure.testing && <span className="bg-orange-900 text-orange-200 text-xs px-2 py-1 rounded">Tests</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Features */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold">
                Key Features
              </h3>

              {understanding.features.length ===
              0 ? (
                <p className="mt-3 text-slate-500">
                  No feature list was extracted.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {understanding.features.map(
                    (feature, index) => (
                      <div
                        key={`${feature}-${index}`}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
                      >
                        {feature}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Development History */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold">
                Development History
              </h3>

              <div className="mt-4 space-y-3">
                {understanding
                  .developmentHistory.length ===
                0 ? (
                  <p className="text-slate-500">
                    No development history
                    available.
                  </p>
                ) : (
                  understanding.developmentHistory.map(
                    (commit, index) => (
                      <div
                        key={`${commit.message}-${index}`}
                        className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                      >
                        <p className="text-sm font-medium text-white">
                          {commit.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {commit.author ??
                            "Unknown"}

                          {commit.date
                            ? ` • ${new Date(
                                commit.date
                              ).toLocaleString()}`
                            : ""}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* Issues + Pull Requests */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Issues
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {
                    understanding.issueSummary
                      .total
                  }
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {
                    understanding.issueSummary
                      .open
                  }{" "}
                  open •{" "}
                  {
                    understanding.issueSummary
                      .closed
                  }{" "}
                  closed
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Pull Requests
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {
                    understanding
                      .pullRequestSummary
                      .total
                  }
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {
                    understanding
                      .pullRequestSummary
                      .open
                  }{" "}
                  open •{" "}
                  {
                    understanding
                      .pullRequestSummary
                      .closed
                  }{" "}
                  closed
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;