"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Error reporting would go here in production
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-white">
      <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
        {/* Error Code */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-200">
          500
        </h1>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 font-kurdish">
            هەڵەیەک ڕوویدا
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto leading-relaxed font-kurdish">
            هەڵەیەکی نادیار لە سیستەمەکەدا ڕوویدا. تکایە دواتر هەوڵ بدەوە.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 inline-block mt-2">
              کۆدی هەڵە: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-4 w-full sm:w-auto">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-medium text-white shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto bg-gradient-brand-button font-kurdish"
          >
            <RefreshCw className="h-5 w-5" />
            <span>هەوڵ بدەوە</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-medium text-white shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto bg-gradient-brand-button font-kurdish"
          >
            <Home className="h-5 w-5" />
            <span>پەڕەی سەرەکی</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

