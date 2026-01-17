'use client';

import Image from "next/image";
import { memo, useMemo } from "react";
import type { ComponentType, SVGProps } from "react";
import { getFlagUrl } from "./constants";

interface DataSectionProps {
  title: string;
  data: Record<string, number>;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  maxItems?: number;
  showFlags?: boolean;
  hideTitle?: boolean;
}

export const DataSection = memo(function DataSection({ title, data, icon: Icon, maxItems = 10, showFlags = false, hideTitle = false }: DataSectionProps) {
  const sorted = useMemo(() => {
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxItems);
  }, [data, maxItems]);

  const total = useMemo(() => {
    return sorted.reduce((sum: number, [, count]: [string, number]) => sum + count, 0);
  }, [sorted]);

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900 font-kurdish">{title}</h3>
        </div>
        <p className="text-xs text-gray-600 font-kurdish">هیچ داتایەک نییە</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Icon className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900 font-kurdish">{title}</h3>
        </div>
      )}
      <div className="space-y-2.5">
        {sorted.map(([key, count]: [string, number]) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
          const flagUrl = showFlags ? getFlagUrl(key) : "";
          return (
            <div key={key} className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {showFlags && flagUrl && (
                  <div className="relative w-5 h-3.5 flex-shrink-0">
                    <Image
                      src={flagUrl}
                      alt={key}
                      width={20}
                      height={14}
                      className="object-cover rounded-sm"
                      unoptimized
                      loading="lazy"
                      onError={(event) => {
                        const target = event.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <span className="text-xs sm:text-sm text-gray-900 truncate font-kurdish">{key}</span>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-20 sm:w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-500 group-hover:bg-red-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5 min-w-[60px]">
                  <span className="text-xs text-gray-700 font-kurdish">{count.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">({percentage}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
