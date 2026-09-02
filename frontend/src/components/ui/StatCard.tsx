import React from "react";
import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
}) => {
  return (
    <Card className="flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-[#8b949e]">{title}</h3>
        {icon && <div className="text-[#8b949e]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <span
            className={`text-xs font-medium ${trend.isPositive ? "text-[#3fb950]" : "text-[#f85149]"
              }`}
          >
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-[#8b949e] mt-1">{description}</p>
      )}
    </Card>
  );
};
