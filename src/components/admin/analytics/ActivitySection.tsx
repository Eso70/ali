'use client';

import { memo } from "react";
import type { ComponentType, SVGProps, ReactNode } from "react";

export interface ActivityEntry {
  ip_address: string;
  platform?: string;
  viewed_at?: string;
  clicked_at?: string;
}

interface ActivitySectionProps {
  entries: ActivityEntry[];
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName: string;
  count: number;
  emptyLabel: string;
  timestampKey: "viewed_at" | "clicked_at";
  formatDateTime: (value: string) => string;
  containerHoverClassName: string;
  ipTextClassName: string;
  platformIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  platformIconClassName?: string;
  platformTextClassName?: string;
  useDefaultDetails?: boolean;
  renderDetails?: (entry: ActivityEntry) => ReactNode;
}

export const ActivitySection = memo(function ActivitySection({
  entries,
  title,
  icon: Icon,
  iconClassName,
  count,
  emptyLabel,
  timestampKey,
  formatDateTime,
  containerHoverClassName,
  ipTextClassName,
  platformIcon: PlatformIcon,
  platformIconClassName,
  platformTextClassName,
  useDefaultDetails = true,
  renderDetails,
}: ActivitySectionProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-4 w-4 ${iconClassName}`} />
        <h3 className="text-sm font-semibold text-gray-900 font-kurdish">{title}</h3>
        <span className="ml-auto text-xs text-gray-600 font-kurdish">
          {count}
        </span>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {entries.length > 0 ? (
          entries.map((entry, index) => {
            const timestamp = entry[timestampKey];
            return (
              <div
                key={`${entry.ip_address}-${timestamp ?? index}`}
                className={`flex flex-col gap-2 p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-150 group border border-gray-200 ${containerHoverClassName}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-sm font-mono font-semibold truncate ${ipTextClassName}`}>
                      {entry.ip_address}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {renderDetails ? renderDetails(entry) : null}

                  {useDefaultDetails && PlatformIcon && entry.platform && (
                    <div className="flex items-center gap-2 text-xs">
                      <PlatformIcon className={`h-3.5 w-3.5 flex-shrink-0 ${platformIconClassName ?? ""}`} />
                      <span className={`font-kurdish font-medium ${platformTextClassName ?? ""}`}>
                        {entry.platform}
                      </span>
                    </div>
                  )}

                  {timestamp && (
                    <div className="text-xs text-gray-500 pt-1">
                      {formatDateTime(timestamp)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-gray-600 font-kurdish text-center py-4">
            {emptyLabel}
          </p>
        )}
      </div>
    </div>
  );
});
