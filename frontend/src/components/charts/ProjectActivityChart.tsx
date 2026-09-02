import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const ProjectActivityChart = ({
  commits,
  issues,
  pullRequests,
  documents,
}: {
  commits: number;
  issues: number;
  pullRequests: number;
  documents: number;
}) => {
  const data = [
    { name: "Commits", value: commits, color: "#3b82f6" },
    { name: "Issues", value: issues, color: "#eab308" },
    { name: "PRs", value: pullRequests, color: "#a855f7" },
    { name: "Docs", value: documents, color: "#94a3b8" },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col">
      <h3 className="text-lg font-semibold text-white">Project Activity</h3>
      <p className="mb-4 text-sm text-slate-400">Activity overview</p>

      <div className="h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "#1e293b" }}
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "0.5rem" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0] as [number, number, number, number]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
