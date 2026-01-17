"use client";

import Image from "next/image";
import { memo, useMemo, useCallback } from "react";
import { Footer } from "@/components/public/Footer";
import { deriveTextSecondaryColor } from "@/lib/utils/theme-colors";
import {
  getPlatformIcon,
  getPlatformName,
  getPlatformColors,
} from "@/components/public/LinktreeButtons";
import type { TemplateComponentProps } from "./types";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";

const FALLBACK_SUBTITLE = "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە";

export const SmartbioTemplate = memo(function SmartbioTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  // No state needed - footer always visible, no scrolling
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  // Get background gradient from theme
  const backgroundGradient = useMemo(
    () => ({
      background: `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`,
    }),
    [theme.from, theme.via, theme.to],
  );

  // SmartbioTemplate has white background, so always use dark text
  const _textColor = useMemo(() => "#1f2937", []);
  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);

  const handleLinkClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick]
  );

  // Get first 4 links for social icons in header
  const socialLinks = useMemo(() => links.slice(0, 4), [links]);
  // All links shown in the white section
  const allLinks = useMemo(() => links, [links]);

  return (
    <div 
      className="relative w-full min-h-screen bg-white overflow-y-auto"
      style={{
        contain: "layout style paint",
      }}
    >
      {/* Header Section with Gradient and Curve */}
      <div 
        className="relative w-full h-40 sm:h-44 md:h-48 lg:h-52"
        style={backgroundGradient}
      >
        {/* Bottom Curve SVG */}
        <div 
          className="absolute bottom-0 left-0 w-full overflow-hidden" 
          style={{ height: '60px' }}
        >
          <svg 
            viewBox="0 0 500 120" 
            preserveAspectRatio="none" 
            className="w-full h-full"
          >
            <path 
              d="M0,120 Q250,0 500,120 L500,120 L0,120 Z" 
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Profile Section - Overlapping Header and White Section */}
      <div className="relative -mt-16 sm:-mt-18 md:-mt-20 lg:-mt-22 px-4 sm:px-6 text-center">
        {/* Profile Image */}
        <div className="inline-block mb-1 sm:mb-1.5">
          <Image
            src={profileImage}
            alt={linktree.name}
            width={160}
            height={160}
            quality={75}
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-white shadow-xl object-cover"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
            onError={(e) => {
              // Silently handle image load errors
              const target = e.target as HTMLImageElement;
              if (target.src !== profileImage) {
                target.src = profileImage;
              }
            }}
          />
        </div>

        {/* Name */}
        <h1 
          className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1 px-2 font-kurdish"
        >
          {linktree.name}
        </h1>

        {/* Subtitle/Description */}
        <p 
          className="text-[10px] sm:text-xs md:text-sm lg:text-base mb-6 sm:mb-8 md:mb-10 px-2 font-kurdish mx-auto line-clamp-2"
          style={{ color: textSecondaryColor }}
        >
          {subtitle}
        </p>

        {/* Social Media Icons */}
        {socialLinks.length > 0 && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-5 md:mb-6 px-2" dir="ltr">
            {socialLinks.map((link) => {
              const icon = getPlatformIcon(link.platform, "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white");
              const colors = getPlatformColors(link.platform);
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id, link.url, link.platform, link.default_message)}
                  className="group relative w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-lg hover:shadow-xl overflow-hidden"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.from}, ${colors.via}, ${colors.to})`,
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                    willChange: "transform",
                    contain: "layout style paint",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget;
                    if (typeof window !== "undefined" && window.innerWidth >= 640) {
                      requestAnimationFrame(() => {
                        if (!target || !target.isConnected) return;
                        const hoverFrom = colors.from.replace("0.85", "0.95").replace("0.9", "1.0").replace("0.8", "0.9");
                        const hoverVia = colors.via.replace("0.9", "1.0").replace("0.85", "0.95").replace("0.8", "0.9");
                        const hoverTo = colors.to.replace("0.85", "0.95").replace("0.9", "1.0").replace("0.8", "0.9");
                        target.style.background = `linear-gradient(to bottom right, ${hoverFrom || colors.from}, ${hoverVia || colors.via}, ${hoverTo || colors.to})`;
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget;
                    requestAnimationFrame(() => {
                      if (!target || !target.isConnected) return;
                      target.style.background = `linear-gradient(to bottom right, ${colors.from}, ${colors.via}, ${colors.to})`;
                    });
                  }}
                  aria-label={getPlatformName(link.platform)}
                >
                  <div 
                    className="absolute inset-0 overflow-hidden hidden sm:block"
                    style={{
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden"
                    }}
                  >
                    <div 
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"
                      style={{
                        filter: 'blur(10px)',
                        transform: "translateZ(0)",
                        willChange: "transform",
                        backfaceVisibility: "hidden"
                      }}
                    />
                  </div>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block"
                    style={{
                      background: `radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 70%)`,
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden"
                    }}
                  />
                  <span className="relative z-10">
                    {icon}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Links Section - White Background */}
      <div className="px-4 sm:px-6 pb-4 bg-gradient-to-b from-white via-gray-50/30 to-white">
        <div className="mx-auto pt-2 sm:pt-3 md:pt-4 space-y-4 sm:space-y-4.5 md:space-y-5 px-4 max-w-2xl">
          {allLinks.map((link, index) => {
            const platformName = getPlatformName(link.platform);
            const label = link.display_name || platformName;
            const colors = getPlatformColors(link.platform);
            const icon = getPlatformIcon(link.platform, "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white");

            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url, link.platform, link.default_message)}
                className="group btn-spotlight relative w-full overflow-hidden rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 text-xs sm:text-sm md:text-base font-medium text-white text-left backdrop-blur-sm sm:backdrop-blur-md shadow-[0_4px_16px_rgba(59,130,246,0.12)] sm:shadow-[0_4px_20px_rgba(59,130,246,0.15)] transition-all duration-200 sm:duration-300 ease-out active:scale-[0.98] sm:hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(59,130,246,0.2)] sm:hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)] touch-manipulation font-kurdish"
                dir="ltr"
                style={{
                  background: `linear-gradient(to bottom right, ${colors.from}, ${colors.via}, ${colors.to})`,
                  animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
                  contain: "layout style paint",
                  transform: "translateZ(0)",
                  willChange: "transform",
                  backfaceVisibility: "hidden"
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  if (typeof window !== "undefined" && window.innerWidth >= 640) {
                    requestAnimationFrame(() => {
                      if (!target || !target.isConnected) return;
                      const hoverFrom = colors.from.replace("0.85", "0.95").replace("0.9", "1.0").replace("0.8", "0.9");
                      const hoverVia = colors.via.replace("0.9", "1.0").replace("0.85", "0.95").replace("0.8", "0.9");
                      const hoverTo = colors.to.replace("0.85", "0.95").replace("0.9", "1.0").replace("0.8", "0.9");
                      target.style.background = `linear-gradient(to bottom right, ${hoverFrom || colors.from}, ${hoverVia || colors.via}, ${hoverTo || colors.to})`;
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  requestAnimationFrame(() => {
                    if (!target || !target.isConnected) return;
                    target.style.background = `linear-gradient(to bottom right, ${colors.from}, ${colors.via}, ${colors.to})`;
                  });
                }}
              >
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden"
                  }}
                >
                  <div 
                    className="absolute inset-0 w-1/3 animate-spotlight hidden sm:block"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                      filter: 'blur(8px)',
                      transform: "translateZ(0)",
                      willChange: "transform",
                      backfaceVisibility: "hidden"
                    }}
                  />
                </div>
                <div 
                  className="absolute inset-0 overflow-hidden hidden sm:block"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden"
                  }}
                >
                  <div 
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"
                    style={{
                      filter: 'blur(12px)',
                      transform: "translateZ(0)",
                      willChange: "transform",
                      backfaceVisibility: "hidden"
                    }}
                  />
                </div>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block"
                  style={{
                    background: `radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)`,
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden"
                  }}
                />
                <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 md:gap-4" dir="ltr">
                  <div className="flex-shrink-0">
                    {icon}
                  </div>
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-white text-left flex-1 min-w-0 truncate font-kurdish">
                    {label}
                  </span>
                  <div className="text-white/60 hover:text-white transition-colors flex-shrink-0">
                    <svg
                      width="20"
                      height="20"
                      className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}

          {allLinks.length === 0 && (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <p className="text-gray-500 font-kurdish text-sm sm:text-base">هیچ لینکێک نییە</p>
            </div>
          )}
        </div>
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

      {/* Slide Up Animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}, areTemplatePropsEqual);
