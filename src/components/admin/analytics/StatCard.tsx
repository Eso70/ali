'use client';

import { memo } from "react";
import type { ComponentType, SVGProps } from "react";

export type StatCardColor = "blue" | "green" | "purple" | "orange" | "slate";

interface StatCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number | string;
  color?: StatCardColor;
  subtitle?: string;
}

export const StatCard = memo(function StatCard({ icon: Icon, label, value, color = "blue", subtitle }: StatCardProps) {
  const colorClasses: Record<StatCardColor, string> = {
    blue: "bg-gradient-to-br from-sky-50/70 to-blue-50/70 border-sky-100 text-sky-700",
    green: "bg-gradient-to-br from-emerald-50/70 to-green-50/70 border-emerald-100 text-emerald-700",
    purple: "bg-gradient-to-br from-violet-50/70 to-purple-50/70 border-violet-100 text-violet-700",
    orange: "bg-gradient-to-br from-red-50/70 to-red-50/70 border-red-100 text-red-700",
    slate: "bg-gradient-to-br from-slate-50/70 to-gray-50/70 border-slate-100 text-slate-700",
  };

  const iconBgClasses: Record<StatCardColor, string> = {
    blue: "bg-gradient-to-br from-sky-100 to-blue-100 border-sky-200",
    green: "bg-gradient-to-br from-emerald-100 to-green-100 border-emerald-200",
    purple: "bg-gradient-to-br from-violet-100 to-purple-100 border-violet-200",
    orange: "bg-gradient-to-br from-red-100 to-red-100 border-red-200",
    slate: "bg-gradient-to-br from-slate-100 to-gray-100 border-slate-200",
  };

  const iconColorClasses: Record<StatCardColor, string> = {
    blue: "text-sky-500",
    green: "text-emerald-500",
    purple: "text-violet-500",
    orange: "text-red-500",
    slate: "text-slate-500",
  };

  return (
    <div className={`group relative rounded-2xl ${colorClasses[color]} p-5 sm:p-6 border transition-all duration-300 hover:shadow-lg overflow-hidden backdrop-blur-sm`}>
      <div className="relative flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBgClasses[color]} border group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColorClasses[color]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-2xl sm:text-3xl font-bold font-kurdish mb-1 text-slate-700">{typeof value === "number" ? value.toLocaleString() : value}</div>
          <div className="text-xs sm:text-sm text-slate-600 font-kurdish font-medium">{label}</div>
          {subtitle && (
            <div className="text-xs text-slate-500 font-kurdish mt-1.5">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
});
