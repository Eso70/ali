"use client";

import Image from "next/image";
import { memo, useMemo, useCallback } from "react";
import {
  getPlatformIcon,
  getPlatformName,
  getPlatformColors,
} from "@/components/public/LinktreeButtons";
import type { TemplateComponentProps } from "./types";
import { deriveTextColor, deriveTextSecondaryColor } from "@/lib/utils/theme-colors";
import { Footer } from "@/components/public/Footer";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";

const FALLBACK_SUBTITLE = "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە";

export const SoftSystemTemplate = memo(function SoftSystemTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  // iOS/macOS style system design: very soft, minimal, clean
  const backgroundStyle = useMemo(
    () => ({
      background: theme.isSolid
        ? theme.from
        : `linear-gradient(180deg, ${theme.from} 0%, ${theme.via} 50%, ${theme.to} 100%)`,
    }),
    [theme.from, theme.via, theme.to, theme.isSolid],
  );

  // Since cards have white backgrounds, use dark colors for better contrast on cards
  // Primary text should be dark for readability on white cards
  const cardTextColor = useMemo(() => "#1f2937", []); // gray-800 - dark for white cards
  const cardTextSecondaryColor = useMemo(() => "#6b7280", []); // gray-500 - medium for white cards
  
  // Footer uses theme-derived colors since it's on the gradient background
  const footerTextColor = useMemo(() => deriveTextColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);
  const footerTextSecondaryColor = useMemo(() => deriveTextSecondaryColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);

  const handleClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick],
  );

  return (
    <div className="relative w-full min-h-screen overflow-y-auto px-5 py-10 sm:py-16" style={backgroundStyle}>
      {/* Subtle system-style background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" aria-hidden />
      
      <div className="relative w-full max-w-md mx-auto">
        {/* Profile Section - iOS Style Card */}
        <div 
          className="bg-white/80 backdrop-blur-2xl rounded-3xl sm:rounded-[2rem] p-8 sm:p-10 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/40"
          style={{
            animation: "systemFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex flex-col items-center text-center gap-5">
            {/* Avatar - System rounded square style */}
            <div 
              className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-1 ring-white/30"
            >
              <Image
                src={profileImage}
                alt={linktree.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 112px, 128px"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== profileImage) {
                    target.src = profileImage;
                  }
                }}
              />
            </div>

            {/* Name - System typography */}
            <h1 
              className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-tight font-kurdish"
              style={{ 
                color: cardTextColor,
                animation: "systemFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
              }}
            >
              {linktree.name}
            </h1>

            {/* Subtitle - Minimal system style */}
            <p 
              className="text-sm sm:text-base px-5 py-2.5 rounded-full bg-white/50 backdrop-blur-md border border-white/30 font-kurdish"
              style={{ 
                color: cardTextSecondaryColor,
                animation: "systemFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both",
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Links - iOS System Button Style */}
        <div className="space-y-3 mb-20" dir="ltr">
          {links.length === 0 ? (
            <div 
              className="bg-white/80 backdrop-blur-2xl rounded-2xl p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-white/40"
              style={{ color: cardTextSecondaryColor }}
            >
              <p className="text-sm font-medium font-kurdish">هێشتا هیچ لینکێک نییە</p>
            </div>
          ) : (
            links.map((link, idx) => {
              const colors = getPlatformColors(link.platform);
              const label = link.display_name || getPlatformName(link.platform);
              const icon = getPlatformIcon(link.platform, "w-5 h-5 sm:w-6 sm:h-6");

              return (
                <button
                  key={link.id}
                  onClick={() => handleClick(link.id, link.url, link.platform, link.default_message)}
                  className="group relative flex w-full items-center gap-4 rounded-2xl px-5 py-4.5 bg-white/80 backdrop-blur-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white/40 transition-all duration-200 ease-out hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:scale-[0.98] active:shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
                  style={{
                    animation: `systemSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + idx * 0.04}s both`,
                  }}
                >
                  {/* Icon - System style rounded square */}
                  <div
                    className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-200 group-hover:scale-105 ring-1 ring-white/20"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                    }}
                  >
                    <div className="text-white drop-shadow-sm">{icon}</div>
                  </div>

                  {/* Label - System typography */}
                  <div className="flex-1 text-left min-w-0">
                    <div 
                      className="text-base sm:text-lg font-semibold truncate mb-0.5 tracking-[-0.01em] font-kurdish"
                      style={{ 
                        color: cardTextColor,
                      }}
                    >
                      {label}
                    </div>
                    <div 
                      className="text-xs font-medium opacity-70 font-kurdish"
                      style={{ 
                        color: cardTextSecondaryColor,
                      }}
                    >
                      {getPlatformName(link.platform)}
                    </div>
                  </div>

                  {/* Chevron - System style */}
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/40 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/60 group-hover:translate-x-0.5"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2.5}
                      style={{ color: cardTextSecondaryColor }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
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
          transparent={true}
          textColor={footerTextColor}
          textSecondaryColor={footerTextSecondaryColor}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes systemFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(8px);
          } 
          to { 
            opacity: 1; 
            transform: translateY(0);
          } 
        }
        
        @keyframes systemSlideUp {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          } 
          to { 
            opacity: 1; 
            transform: translateY(0); 
          } 
        }
      ` }} />
    </div>
  );
}, areTemplatePropsEqual);
