"use client";

import { memo, useCallback, useState, useMemo } from "react";
import Image from "next/image";
import { Trash2, Eye, Copy, Check, Edit, ExternalLink, Link as LinkIcon } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatDate, isExpired, getAbsoluteUrl } from "@/lib/utils/linktree-utils";

interface Linktree {
  id: string;
  image?: string;
  name: string;
  subtitle?: string;
  seo_name?: string;
  uid: string;
  template_config?: Record<string, unknown> | null;
  expire_date?: string;
  created_at: string;
  updated_at: string;
  analytics?: {
    unique_views: number;
    unique_clicks: number;
  };
}

interface LinktreesGridProps {
  data?: Linktree[];
  isLoading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, uid: string, name: string) => void;
  onViewAnalytics?: (id: string, name: string) => void;
}

// Memoized card component for better performance
const LinktreeCard = memo(function LinktreeCard({
  item,
  onEdit,
  onDelete,
  onViewAnalytics,
  copiedUid,
  onCopy,
}: {
  item: Linktree;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, uid: string, name: string) => void;
  onViewAnalytics?: (id: string, name: string) => void;
  copiedUid: string | null;
  onCopy: (uid: string, e: React.MouseEvent) => void;
}) {
  const url = useMemo(() => getAbsoluteUrl(item.uid), [item.uid]);

  const handleView = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300 transition-all duration-300">
      {/* Header Section */}
      <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 shadow-sm">
          <Image
            src={item.image || "/images/DefaultAvatar.png"}
            alt={item.name}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 64px, 80px"
            quality={75}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-base font-bold text-gray-900 mb-0.5 sm:mb-1 truncate">
            {item.name}
          </h3>
          {item.subtitle && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-1 sm:mb-1.5">
              {item.subtitle}
            </p>
          )}
          {item.expire_date && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs">
              <span className={`font-mono px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border text-xs ${
                isExpired(item.expire_date)
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}>
                {formatDate(item.expire_date)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* URL Section */}
      <div className="mb-2 sm:mb-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
          <LinkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">URL</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              handleView();
            }}
            className="flex-1 text-xs text-gray-700 hover:text-gray-900 font-mono truncate underline decoration-gray-300 hover:decoration-gray-500 transition-colors"
          >
            {url}
          </a>
          <button
            onClick={(e) => onCopy(item.uid, e)}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Copy URL"
            title="Copy URL"
          >
            {copiedUid === item.uid ? (
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-200">
        {onViewAnalytics && (
          <button
            onClick={() => onViewAnalytics(item.id, item.name)}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 hover:text-purple-800 transition-all duration-200 text-xs font-medium"
            aria-label="View Analytics"
            title="بینینی ئامار"
          >
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline text-xs">ئامار</span>
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(item.id)}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 transition-all duration-200 text-xs font-medium"
            aria-label="Edit"
            title="دەستکاری"
          >
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline text-xs">دەستکاری</span>
          </button>
        )}
        {onDelete && item.uid !== "ali" && (
          <button
            onClick={() => onDelete(item.id, item.uid, item.name)}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 transition-all duration-200 text-xs font-medium"
            aria-label="Delete"
            title="سڕینەوە"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline text-xs">سڕینەوە</span>
          </button>
        )}
        <button
          onClick={handleView}
          className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-700 transition-all duration-200 text-xs font-medium"
          aria-label="View"
          title="بینین"
        >
          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
});

export const LinktreesGrid = memo(function LinktreesGrid({
  data = [],
  isLoading = false,
  onEdit,
  onDelete,
  onViewAnalytics,
}: LinktreesGridProps) {
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const handleCopyUrl = useCallback(async (uid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getAbsoluteUrl(uid);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedUid(uid);
      setTimeout(() => {
        setCopiedUid(null);
      }, 2000);
    }
  }, []);

  const handleDelete = useCallback((id: string, uid: string, name: string) => {
    if (uid === "ali") {
      return;
    }
    if (onDelete) {
      onDelete(id, uid, name);
    }
  }, [onDelete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-red-600 rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">چاوەڕوان بە...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center mb-4">
          <LinkIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">هیچ پەیجەک نەدۆزرایەوە</h3>
        <p className="text-gray-500 text-sm">دەست پێ بکە بە دروستکردنی پەیج یەکەم</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4" dir="ltr">
      {data.map((item) => (
        <LinktreeCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={handleDelete}
          onViewAnalytics={onViewAnalytics}
          copiedUid={copiedUid}
          onCopy={handleCopyUrl}
        />
      ))}
    </div>
  );
});
