"use client";

import { memo, useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Loader2,
  MousePointerClick,
  Users,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { StatCard } from "./analytics/StatCard";
import { flushNow } from "@/lib/utils/client-queue";


// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.7);
  }
`;

interface AnalyticsData {
  unique_views: number;
  unique_clicks: number;
  views_by_device: Record<string, number>;
  clicks_by_platform: Record<string, number>;
  views_by_referer: Record<string, number>;
  clicks_by_referer: Record<string, number>;
  views_by_os: Record<string, number>;
  clicks_by_os: Record<string, number>;
  top_clicked_links: Array<{
    link_id: string;
    platform: string;
    display_name?: string;
    click_count: number;
    recent_clicks?: Array<{
      ip_address: string;
      clicked_at: string;
    }>;
  }>;
  recent_views: Array<{
    ip_address: string;
    viewed_at: string;
  }>;
  recent_clicks: Array<{
    ip_address: string;
    platform?: string;
    clicked_at: string;
  }>;
}

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  linktreeId: string;
  linktreeName: string;
}


export const AnalyticsModal = memo(function AnalyticsModal({
  isOpen,
  onClose,
  linktreeId,
  linktreeName,
}: AnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async (bypassCache = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const { fetchWithCache } = await import('@/lib/utils/cache');
      const url = bypassCache 
        ? `/api/linktrees/${linktreeId}/analytics?_t=${Date.now()}`
        : `/api/linktrees/${linktreeId}/analytics`;
      const result = await fetchWithCache<{ data: AnalyticsData }>(
        url,
        {
          credentials: 'include',
        },
        `/api/linktrees/${linktreeId}/analytics`,
        bypassCache
      );
      
      setAnalytics(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "داتاکان بار نەکران");
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [linktreeId]);

  useEffect(() => {
    if (isOpen && linktreeId) {
      // Fetch data once when modal opens (no auto-refresh to reduce server load)
      fetchAnalytics();
    }
  }, [isOpen, linktreeId, fetchAnalytics]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Flush client-side queue - wait for all data to be sent to server
      await flushNow();
      
      // Step 2: Flush server-side batch queues to database - wait for all inserts to complete
      const flushResponse = await fetch(`/api/linktrees/${linktreeId}/analytics/flush`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!flushResponse.ok) {
        const errorData = await flushResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to flush server queues");
      }
      
      // Wait for flush to complete - this ensures all database inserts are finished
      const flushResult = await flushResponse.json();
      if (!flushResult.success) {
        throw new Error("Queue flush did not complete successfully");
      }
      
      // Step 3: Fetch fresh analytics data (bypassing cache to get latest data)
      await fetchAnalytics(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "هەڵەیەک لە نوێکردنەوەدا ڕوویدا");
      console.error("Error refreshing analytics:", err);
      setIsLoading(false);
    }
  };

  const handleClearAnalytics = async () => {
    setIsClearing(true);
    setError(null);
    try {
      const response = await fetch(`/api/linktrees/${linktreeId}/analytics/clear`, {
        method: 'DELETE',
        cache: 'no-store',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clear analytics");
      }
      
      // Clear client-side cache for analytics
      const { clearCachedData } = await import('@/lib/utils/cache');
      clearCachedData(`/api/linktrees/${linktreeId}/analytics`);
      
      // Refresh analytics after clearing
      await fetchAnalytics();
      setShowConfirmDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "هەڵەیەک ڕوویدا");
      console.error("Error clearing analytics:", err);
    } finally {
      setIsClearing(false);
    }
  };


  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Calculate conversion rate based on unique views/clicks
  const conversionRate = useMemo(() => {
    if (!analytics || analytics.unique_views === 0) return "0.0";
    return ((analytics.unique_clicks / analytics.unique_views) * 100).toFixed(1);
  }, [analytics]);



  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-md overflow-y-auto"
        onClick={handleBackdropClick}
        dir="rtl"
      >
      <div 
        className="relative w-full max-w-4xl my-4 sm:my-8 rounded-2xl bg-primary-95 backdrop-blur-sm border border-gray-100 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-5 sm:p-6 border-b border-gray-100/50 bg-gradient-to-r from-white to-slate-50/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-50 to-brand-50 border border-brand-100 shadow-sm">
                  <BarChart3 className="h-5 w-5 text-brand-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-700 font-kurdish">داتاکانی بینین</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-kurdish truncate">{linktreeName}</p>
                </div>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-sm" />
                  <span className="font-kurdish">
                    دواین نوێکردنەوە: {new Intl.DateTimeFormat("ku", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }).format(lastUpdated)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={isLoading || isClearing || !analytics || (analytics.unique_views === 0 && analytics.unique_clicks === 0)}
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-all text-rose-500 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-rose-50 disabled:hover:to-pink-50 border border-rose-100 hover:border-rose-200 shadow-sm hover:shadow"
                aria-label="Clear Analytics"
                title={!analytics || (analytics.unique_views === 0 && analytics.unique_clicks === 0) ? "هیچ داتایەک نییە" : "پاککردنەوەی داتاکان"}
              >
                <Trash2 className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleRefresh();
                }}
                disabled={isLoading || isClearing}
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow"
                aria-label="Refresh"
                title="نوێکردنەوە"
              >
                <RefreshCw className={`h-5 w-5 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              </button>
              <button
                onClick={onClose}
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all text-slate-500 hover:text-slate-700 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow"
                aria-label="داخستن"
              >
                <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 overflow-y-auto max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-220px)] custom-scrollbar bg-gradient-to-br from-white to-slate-50/20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-red-500 mb-4" />
              <p className="text-sm text-slate-500 font-kurdish">داتاکان بار دەکرێن...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-rose-500 mb-4 font-kurdish">{error}</p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  fetchAnalytics(true);
                }}
                className="px-4 py-2.5 rounded-xl text-white font-kurdish shadow-lg hover:shadow-xl transition-all bg-gradient-brand-button"
              >
                هەوڵ بدەوە
              </button>
            </div>
          ) : analytics ? (
            <div className="space-y-4 sm:space-y-5">
              {/* Main Stats - Only Unique Views/Clicks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <StatCard
                      icon={Users}
                      label="بینەری جیاواز"
                      value={analytics.unique_views}
                      color="green"
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="کلیکەری جیاواز"
                      value={analytics.unique_clicks}
                      color="orange"
                    />
                    <StatCard
                      icon={BarChart3}
                      label="ڕێژەی گۆڕان"
                      value={`${conversionRate}%`}
                      color="slate"
                      subtitle={`${analytics.unique_clicks} / ${analytics.unique_views}`}
                    />
                  </div>

                  {/* Top Clicked Links */}
                  {analytics.top_clicked_links.length > 0 && (
                    <div className="rounded-2xl bg-gradient-to-br from-slate-50/50 to-gray-50/50 p-4 sm:p-5 border border-slate-100/50 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <MousePointerClick className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-semibold text-slate-700 font-kurdish">زۆرترین کلیک</h3>
                      </div>
                      <div className="space-y-2">
                        {analytics.top_clicked_links.map((link, index) => (
                          <div
                            key={link.link_id}
                            className="p-3 rounded-xl bg-primary-80 backdrop-blur-sm hover:bg-primary hover:shadow-md border border-slate-100/50 transition-all duration-300 group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
                                  index === 0 ? "bg-gradient-to-br from-brand-100 to-brand-100 text-brand-600 border border-brand-200" :
                                  index === 1 ? "bg-gradient-to-br from-slate-100 to-gray-100 text-slate-500 border border-slate-200" :
                                  index === 2 ? "bg-gradient-to-br from-red-100 to-red-100 text-red-500 border border-red-200" :
                                  "bg-gradient-to-br from-slate-50 to-gray-50 text-slate-400 border border-slate-100"
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-slate-700 font-kurdish truncate">
                                    {link.display_name || link.platform}
                                  </div>
                                  <div className="text-xs text-slate-500 font-kurdish">{link.platform}</div>
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-slate-700 font-kurdish flex-shrink-0 ml-3">
                                {link.click_count.toLocaleString()} کلیک
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
            </div>
          ) : null}
        </div>
      </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/40 backdrop-blur-md overflow-y-auto">
          <div 
            className="relative w-full max-w-md my-2 sm:my-4 rounded-2xl bg-primary-95 backdrop-blur-sm border border-gray-100/50 shadow-xl overflow-hidden"
            dir="rtl"
          >
            {/* Content */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50/30">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-50/70 to-pink-50/70 border border-rose-100/50 flex items-center justify-center">
                  <Trash2 className="h-7 w-7 text-rose-400" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-6">
                <p className="text-base text-slate-600 font-kurdish leading-relaxed">
                  دڵنیایت لە پاککردنەوەی داتاکان؟
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-br from-slate-50/80 to-gray-50/80 hover:from-slate-100 hover:to-gray-100 border border-slate-100/50 text-slate-600 hover:text-slate-700 font-medium font-kurdish transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow"
                >
                  هەڵوەشاندنەوە
                </button>
                <button
                  onClick={handleClearAnalytics}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium font-kurdish transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 shadow-md hover:shadow-lg"
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>پاککردنەوە...</span>
                    </>
                  ) : (
                    <span>بەڵێ</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
