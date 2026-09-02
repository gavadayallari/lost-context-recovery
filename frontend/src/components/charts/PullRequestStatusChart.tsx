import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const PullRequestStatusChart = ({ open, closed }: { open: number; closed: number }) => {
  if (open === 0 && closed === 0) {
    return (
      <div className="flex h-64 flex-col justify-center rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-lg font-semibold text-white">Pull Request Status</h3>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-400">No pull request activity available</p>
        </div>
      </div>
    );
  }

  const data = [
    { name: "Open", value: open, color: "#a855f7" },
    { name: "Closed", value: closed, color: "#22c55e" },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col">
      <h3 className="text-lg font-semibold text-white">Pull Request Status</h3>
      
      <div className="h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "0.5rem" }}
              itemStyle={{ color: "#f8fafc" }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
