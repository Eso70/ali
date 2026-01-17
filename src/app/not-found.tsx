"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-white">
      <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
        {/* Error Code */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-200">
          404
        </h1>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 font-kurdish">
            پەڕە نەدۆزرایەوە
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto leading-relaxed font-kurdish">
            هیچ پەڕەیەک نەدۆزرایەوە. تکایە دواتر هەوڵبدەوە یان بگەڕێوە بۆ پەڕەی سەرەکی.
          </p>
        </div>

        {/* Action Button */}
        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-medium text-white shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto bg-gradient-brand-button font-kurdish"
        >
          <Home className="h-5 w-5" />
          <span>پەڕەی سەرەکی</span>
        </Link>
      </div>
    </main>
  );
}

