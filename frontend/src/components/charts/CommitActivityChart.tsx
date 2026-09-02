import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Commit = {
  commit_date: string | null;
};

export const CommitActivityChart = ({ commits }: { commits: Commit[] }) => {
  if (!commits || commits.length === 0) {
    return (
      <div className="flex h-64 flex-col justify-center rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-lg font-semibold text-white">Commit Activity</h3>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-400">No commit activity available</p>
        </div>
      </div>
    );
  }

  // Aggregate commits by date
  const commitCounts: Record<string, number> = {};
  commits.forEach((commit) => {
    if (commit.commit_date) {
      const date = new Date(commit.commit_date).toISOString().split("T")[0];
      commitCounts[date] = (commitCounts[date] || 0) + 1;
    }
  });

  const data = Object.entries(commitCounts)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, count]) => ({ date, commits: count }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col">
      <h3 className="text-lg font-semibold text-white">Commit Activity</h3>
      <p className="mb-4 text-sm text-slate-400">Repository activity over time</p>
      
      <div className="h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }}
              itemStyle={{ color: "#3b82f6" }}
            />
            <Area type="monotone" dataKey="commits" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCommits)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
