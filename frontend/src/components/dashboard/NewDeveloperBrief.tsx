import { Link } from "react-router-dom";

type NewDeveloperBriefProps = {
  owner: string;
  repo: string;
  understanding: any;
};

export const NewDeveloperBrief = ({
  owner,
  repo,
  understanding,
}: NewDeveloperBriefProps) => {
  return (
    <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">New Developer Brief</h2>
          <p className="mt-1 text-sm text-slate-400">Everything you need to know to get started</p>
        </div>
        
        <Link
          to={`/dashboard/${owner}/${repo}/ask`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Ask AI Assistant →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="font-semibold text-white">What this project does</h3>
          <p className="mt-2 text-sm text-slate-400 line-clamp-4">
            {understanding.purpose || "No purpose defined."}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="font-semibold text-white">Main Technology</h3>
          <p className="mt-2 text-sm text-slate-400">
            {understanding.technology || "Unknown"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="font-semibold text-white">Important Features</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-slate-400 line-clamp-4">
            {understanding.features.length > 0
              ? understanding.features.slice(0, 4).map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))
              : <li>No key features listed</li>}
          </ul>
        </div>
        
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="font-semibold text-white">Recent Changes</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-slate-400 line-clamp-4">
            {understanding.developmentHistory.length > 0
              ? understanding.developmentHistory.slice(0, 4).map((h: any, i: number) => (
                  <li key={i}>{h.message}</li>
                ))
              : <li>No recent changes found</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="font-semibold text-white">Project State</h3>
          <div className="mt-2 space-y-2 text-sm text-slate-400">
            <p>Open Issues: <span className="font-medium text-white">{understanding.issueSummary.open}</span></p>
            <p>Open PRs: <span className="font-medium text-white">{understanding.pullRequestSummary.open}</span></p>
            <p>README: <span className="font-medium text-white">{understanding.readmeAvailable ? "Available" : "Missing"}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
