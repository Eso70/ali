"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LayoutDashboard, Plus, RefreshCw, Trash2 } from "lucide-react";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileDropdown } from "@/components/ProfileDropdown";

interface AdminHeaderProps {
  onCreateNew?: () => void;
  onRefresh?: () => void;
  onProfileClick?: () => void;
}

export function AdminHeader({ onCreateNew, onRefresh, onProfileClick }: AdminHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [hasAnalyticsData, setHasAnalyticsData] = useState<boolean | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Check if analytics data exists
  useEffect(() => {
    const checkAnalyticsData = async () => {
      try {
        const response = await fetch("/api/analytics/totals", {
          credentials: "include",
          cache: 'no-store',
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || {};
          const hasData = (data.total_views || 0) > 0 || (data.total_clicks || 0) > 0;
          setHasAnalyticsData(hasData);
        } else {
          setHasAnalyticsData(false);
        }
      } catch (error) {
        console.error("Error checking analytics data:", error);
        setHasAnalyticsData(false);
      }
    };

    checkAnalyticsData();
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      // Re-check analytics data after refresh
      const response = await fetch("/api/analytics/totals", {
        credentials: "include",
        cache: 'no-store',
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        const hasData = (data.total_views || 0) > 0 || (data.total_clicks || 0) > 0;
        setHasAnalyticsData(hasData);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const handleClearAllAnalytics = useCallback(async () => {
    setIsClearing(true);
    try {
      const response = await fetch("/api/analytics/clear-all", {
        method: "DELETE",
        credentials: "include",
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clear analytics");
      }

      // Refresh data after clearing
      if (onRefresh) {
        await onRefresh();
      }

      // Update analytics data state
      setHasAnalyticsData(false);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error clearing analytics:", error);
      alert(error instanceof Error ? error.message : "هەڵەیەک ڕوویدا");
    } finally {
      setIsClearing(false);
    }
  }, [onRefresh]);

  const handleLogout = useCallback(async () => {
    setIsDropdownOpen(false);
    setIsLoading(true);
    
    try {
      // Call logout API to invalidate session in database
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors, still redirect
    }
    
    // Clear any local state and redirect to login
    // Using window.location.href ensures full page reload and cookie deletion
    window.location.href = "/login";
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 transition-all duration-400"
      dir="ltr"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 relative">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            <div
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-red-50 border border-red-200 shadow-sm flex-shrink-0"
            >
              <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-700 leading-tight tracking-tight truncate">
                داشبۆرد
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                بەڕێوەبردنی سیستەم
              </p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isRefreshing || isClearing || hasAnalyticsData === false}
              className="group relative flex items-center justify-center p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border border-rose-100 transition-all duration-300 text-rose-500 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm hover:shadow"
              aria-label="Clear All Analytics"
              title={hasAnalyticsData === false ? "هیچ داتایەک نییە" : "پاککردنەوەی هەموو داتاکان"}
            >
              <Trash2 className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" />
            </button>
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isClearing}
                className="group relative flex items-center justify-center p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-100 transition-all duration-300 text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm hover:shadow"
                aria-label="Refresh"
                title="نوێکردنەوە"
              >
                <RefreshCw className={`h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              </button>
            )}
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="group relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl text-xs sm:text-sm md:text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-red-400 via-red-500 to-red-400 hover:from-red-500 hover:via-red-600 hover:to-red-500"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="font-kurdish hidden xs:inline">بەستەری نوێ</span>
              </button>
            )}
            <div className="flex items-center gap-2 sm:gap-3 relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="group flex items-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white rounded-full p-0.5"
                aria-label="Profile menu"
              >
                <div className="ring-2 ring-slate-200 group-hover:ring-red-300 rounded-full transition-all duration-300 shadow-sm">
                  <ProfileAvatar size="md" />
                </div>
              </button>

              <ProfileDropdown
                isOpen={isDropdownOpen}
                isLoading={isLoading}
                onLogout={handleLogout}
                onProfileClick={() => {
                  setIsDropdownOpen(false);
                  onProfileClick?.();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-100/50 shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50/30">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-50/70 to-pink-50/70 border border-rose-100/50 flex items-center justify-center">
                  <Trash2 className="h-7 w-7 text-rose-400" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-6">
                <p className="text-base text-slate-600 leading-relaxed">
                  دڵنیایت لە پاککردنەوەی هەموو داتاکانی بینین و کلیک؟
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-br from-slate-50/80 to-gray-50/80 hover:from-slate-100 hover:to-gray-100 border border-slate-100/50 text-slate-600 hover:text-slate-700 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow"
                >
                  هەڵوەشاندنەوە
                </button>
                <button
                  onClick={handleClearAllAnalytics}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 shadow-md hover:shadow-lg"
                >
                  {isClearing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
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
    </header>
  );
}

