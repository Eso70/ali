"use client";

import Image from "next/image";
import { memo, useMemo, useCallback } from "react";
import { Footer } from "@/components/public/Footer";
import { deriveTextSecondaryColor } from "@/lib/utils/theme-colors";
import { Leaf, Flower2 } from "lucide-react";
import {
  getPlatformIcon,
  getPlatformName,
} from "@/components/public/LinktreeButtons";
import type { TemplateComponentProps } from "./types";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";

const FALLBACK_SUBTITLE = "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە";

export const OrganicNatureTemplate = memo(function OrganicNatureTemplate({
  linktree,
  links,
  theme: _theme, // Not used - template has fixed colors
  onLinkClick,
}: TemplateComponentProps) {
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  const backgroundStyle = useMemo(
    () => ({
      background: "#ffffff", // Pure white background
    }),
    [],
  );

  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor("#ffffff", "#ffffff", "#ffffff"), []);

  const handleLinkClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick]
  );

  return (
    <div 
      className="relative flex min-h-screen w-full justify-center overflow-y-auto px-4 py-12 pb-4"
      style={backgroundStyle}
    >
      {/* Decorative Elements - Fixed green colors */}
      <div 
        className="absolute top-10 left-5 w-32 h-32 rounded-full blur-3xl" 
        style={{ backgroundColor: `#10b9814d` }} // Fixed green
        aria-hidden 
      />
      <div 
        className="absolute top-40 right-10 w-40 h-40 rounded-full blur-3xl" 
        style={{ backgroundColor: `#14b8a64d` }} // Fixed teal
        aria-hidden 
      />
      <div 
        className="absolute bottom-20 left-1/4 w-36 h-36 rounded-full blur-3xl" 
        style={{ backgroundColor: `#10b9814d` }} // Fixed green
        aria-hidden 
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        {/* Decorative Branch - Fixed green colors */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-full h-20 opacity-30" aria-hidden>
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M20,80 Q100,20 180,80" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="40" cy="65" r="3" fill="#10b981" />
            <circle cx="80" cy="45" r="3" fill="#10b981" />
            <circle cx="120" cy="45" r="3" fill="#10b981" />
            <circle cx="160" cy="65" r="3" fill="#10b981" />
          </svg>
        </div>

        {/* Profile Card */}
        <div 
          className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 w-full shadow-lg"
          style={{ border: `1px solid rgba(16, 185, 129, 0.2)` }} // Fixed green border
        >
          <div className="text-center">
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-teal-300 rounded-full blur-lg opacity-50" aria-hidden />
              <div 
                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 sm:border-3 md:border-4 border-white shadow-xl overflow-hidden"
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  willChange: "auto"
                }}
              >
                <Image
                  src={profileImage}
                  alt={linktree.name}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                  className="object-cover"
                  priority
                  quality={75}
                  onError={(e) => {
                    // Silently handle image load errors
                    const target = e.target as HTMLImageElement;
                    if (target.src !== profileImage) {
                      target.src = profileImage;
                    }
                  }}
                />
              </div>
              {/* Decorative Leaves - Fixed green colors */}
              <div 
                className="absolute -top-2 -right-2" 
                style={{ color: "#10b981" }} // Fixed green
                aria-hidden
              >
                <Leaf className="w-6 h-6 rotate-45" />
              </div>
              <div 
                className="absolute -bottom-1 -left-2" 
                style={{ color: "#34d399" }} // Fixed teal
                aria-hidden
              >
                <Flower2 className="w-6 h-6 -rotate-12" />
              </div>
            </div>
            
            <h1 
              className="text-3xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {linktree.name}
            </h1>
            <p className="text-green-700 text-sm font-medium mb-6">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2.5 sm:space-y-3 w-full mb-16">
          {links.length === 0 ? (
            <div 
              className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-4.5 md:p-5 border-2 text-center"
              style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }} // Fixed green border
            >
              <p className="text-gray-600 text-xs sm:text-sm">هێشتا هیچ لینکێک نییە</p>
            </div>
          ) : (
            links.map((link) => {
              const label = link.display_name || getPlatformName(link.platform);

              return (
                <button
                  key={link.id}
                  type="button"
                  dir="ltr"
                  onClick={() => handleLinkClick(link.id, link.url, link.platform, link.default_message)}
                  className="group block bg-white/70 backdrop-blur-sm hover:bg-white/90 rounded-2xl sm:rounded-3xl p-4 sm:p-4.5 md:p-5 border-2 transition-all duration-300 hover:shadow-md w-full text-left"
                  style={{
                    borderColor: 'rgba(16, 185, 129, 0.3)', // Fixed green border
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'; // Fixed green hover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; // Fixed green
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div 
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                      style={{
                        background: `linear-gradient(to bottom right, #10b981, #34d399)`, // Fixed green gradient
                      }}
                    >
                      {getPlatformIcon(link.platform, "w-5 h-5 sm:w-6 sm:h-6 text-white")}
                    </div>
                    <span className="text-gray-800 font-semibold text-sm sm:text-base flex-1 min-w-0 truncate">
                      {label}
                    </span>
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                      style={{
                        backgroundColor: `#10b9811a`, // Fixed green background
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `#10b98133`; // Fixed green hover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `#10b9811a`; // Fixed green
                      }}
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <Footer 
          footerText={linktree.footer_text}
          footerPhone={linktree.footer_phone}
          footerHidden={linktree.footer_hidden ?? false}
          transparent={false}
          textColor="#1f2937"
          textSecondaryColor={textSecondaryColor}
        />
      </div>

      <style jsx>{`
      `}</style>
    </div>
  );
}, areTemplatePropsEqual);
