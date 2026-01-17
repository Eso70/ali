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

export const GentleFlowTemplate = memo(function GentleFlowTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  // Flowing gradient background
  const backgroundStyle = useMemo(
    () => ({
      background: theme.isSolid
        ? theme.from
        : `linear-gradient(180deg, ${theme.from} 0%, ${theme.via} 50%, ${theme.to} 100%)`,
    }),
    [theme.from, theme.via, theme.to, theme.isSolid],
  );

  // Detect if background is white/light - if so, use dark text for compatibility
  const isWhiteBackground = useMemo(() => {
    return theme.isSolid 
      ? (theme.from === "#ffffff" || theme.from === "#f3f4f6" || theme.from === "#e5e7eb" || theme.from === "#ffffff")
      : (theme.from.includes("fff") || theme.from.includes("f3f4f6") || theme.from.includes("e5e7eb") || 
         theme.via.includes("fff") || theme.via.includes("f3f4f6") || theme.via.includes("e5e7eb"));
  }, [theme.from, theme.via, theme.isSolid]);
  
  // Text colors - dark for white backgrounds, theme-derived for colored backgrounds
  const textColor = useMemo(() => {
    if (isWhiteBackground) return "#1f2937"; // gray-800 for white backgrounds
    return deriveTextColor(theme.from, theme.via, theme.to);
  }, [isWhiteBackground, theme.from, theme.via, theme.to]);
  
  const textSecondaryColor = useMemo(() => {
    if (isWhiteBackground) return "#6b7280"; // gray-500 for white backgrounds
    return deriveTextSecondaryColor(theme.from, theme.via, theme.to);
  }, [isWhiteBackground, theme.from, theme.via, theme.to]);

  const handleClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick],
  );

  return (
    <div className="relative w-full min-h-screen overflow-y-auto px-5 py-12 sm:py-16" style={backgroundStyle}>
      {/* Flowing organic shapes background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `radial-gradient(ellipse at top left, ${theme.from}20 0%, transparent 50%), radial-gradient(ellipse at bottom right, ${theme.to}20 0%, transparent 50%)`,
          }}
        />
      </div>
      
      <div className="relative w-full max-w-md mx-auto">
        {/* Profile Section - No card, direct on gradient */}
        <div className="flex flex-col items-center text-center mb-10" style={{ animation: "flowFadeIn 0.7s ease-out" }}>
            {/* Avatar with soft glow */}
            <div 
              className="relative h-28 w-28 sm:h-32 sm:w-32 mb-5 rounded-full overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
              style={{
                border: `4px solid ${isWhiteBackground ? 'rgba(0, 0, 0, 0.1)' : `${textColor}20`}`,
              }}
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

          {/* Name with soft glow effect */}
          <h1 
            className="text-3xl sm:text-4xl font-bold mb-3 font-kurdish drop-shadow-lg"
            style={{ 
              color: textColor,
              textShadow: isWhiteBackground 
                ? "0 2px 10px rgba(0, 0, 0, 0.1)" 
                : `0 2px 10px ${textColor}30`,
            }}
          >
            {linktree.name}
          </h1>

          {/* Subtitle as a flowing badge */}
          <div 
            className="inline-block px-5 py-2 rounded-full backdrop-blur-md border-2 font-kurdish"
            style={{
              color: textSecondaryColor,
              borderColor: isWhiteBackground ? "rgba(0, 0, 0, 0.2)" : `${textColor}40`,
              background: isWhiteBackground ? "rgba(0, 0, 0, 0.05)" : `${textColor}10`,
            }}
          >
            <p className="text-sm sm:text-base">{subtitle}</p>
          </div>
        </div>

        {/* Links - Pill-shaped buttons, no cards */}
        <div className="space-y-4 mb-20" dir="ltr">
          {links.length === 0 ? (
            <div 
              className="text-center py-8 rounded-full backdrop-blur-md border-2 font-kurdish"
              style={{
                color: textSecondaryColor,
                borderColor: isWhiteBackground ? "rgba(0, 0, 0, 0.15)" : `${textColor}30`,
                background: isWhiteBackground ? "rgba(0, 0, 0, 0.05)" : `${textColor}10`,
              }}
            >
              <p className="text-sm">هێشتا هیچ لینکێک نییە</p>
            </div>
          ) : (
            links.map((link, idx) => {
              const colors = getPlatformColors(link.platform);
              const label = link.display_name || getPlatformName(link.platform);
              const icon = getPlatformIcon(link.platform, "w-5 h-5 sm:w-6 sm:h-6");

              // Get platform brand color for text and icons
              // Extract RGB from rgba string (e.g., "rgba(37, 211, 102, 0.85)" -> "rgb(37, 211, 102)")
              const getPlatformBrandColor = (platform: string): string => {
                const platformBrandColors: Record<string, string> = {
                  whatsapp: "#25D366", // WhatsApp Green
                  telegram: "#229ED9", // Telegram Blue
                  viber: "#7360F2", // Viber Purple
                  phone: "#007AFF", // Phone Blue
                  instagram: "#833AB4", // Instagram Purple
                  facebook: "#1877F2", // Facebook Blue
                  twitter: "#000000", // X/Twitter Black
                  x: "#000000", // X Black
                  linkedin: "#0A66C2", // LinkedIn Blue
                  snapchat: "#FFFC00", // Snapchat Yellow
                  tiktok: "#000000", // TikTok Black
                  youtube: "#FF0000", // YouTube Red
                  discord: "#5865F2", // Discord Blurple
                  email: "#1A73E8", // Email Blue
                  website: "#2563EB", // Website Blue
                  custom: "#6B7280", // Custom Gray
                };
                return platformBrandColors[platform] || platformBrandColors.custom;
              };

              const platformColor = getPlatformBrandColor(link.platform);
              
              // Use platform brand color for all text and icons
              // Add white background/outline for better visibility on colored gradients
              const textIconColor = platformColor;

              // Make buttons darker on white backgrounds for better text contrast
              const buttonOpacity = isWhiteBackground ? 'ff' : 'dd'; // Full opacity on white, semi-transparent on colored
              const buttonBorderOpacity = isWhiteBackground ? 'cc' : '80'; // Darker border on white
              const buttonShadowOpacity = isWhiteBackground ? '50' : '40'; // Stronger shadow on white

              return (
                <button
                  key={link.id}
                  onClick={() => handleClick(link.id, link.url, link.platform, link.default_message)}
                  className="group relative flex w-full items-center gap-4 rounded-full px-6 py-4 backdrop-blur-md border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-100"
                  style={{
                    background: `linear-gradient(135deg, ${colors.from}${buttonOpacity}, ${colors.to}${buttonOpacity})`,
                    borderColor: `${colors.from}${buttonBorderOpacity}`,
                    boxShadow: `0 4px 20px ${colors.from}${buttonShadowOpacity}`,
                    animation: `flowSlideUp 0.6s ease-out ${0.1 + idx * 0.06}s both`,
                  }}
                  onMouseEnter={(e) => {
                    const hoverShadowOpacity = isWhiteBackground ? '70' : '60';
                    e.currentTarget.style.boxShadow = `0 8px 30px ${colors.from}${hoverShadowOpacity}`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 20px ${colors.from}${buttonShadowOpacity}`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Icon with white background for platform color visibility */}
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div 
                      style={{
                        color: textIconColor,
                      }}
                    >
                      {icon}
                    </div>
                  </div>

                  {/* Label with white text shadow for visibility */}
                  <div className="flex-1 text-left min-w-0">
                    <div 
                      className="text-base sm:text-lg font-bold truncate mb-0.5 font-kurdish"
                      style={{
                        color: textIconColor,
                        textShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.1)',
                        WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {label}
                    </div>
                    <div 
                      className="text-xs font-medium font-kurdish"
                      style={{
                        color: textIconColor,
                        textShadow: '0 0 6px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(255, 255, 255, 0.7), 0 1px 1px rgba(0, 0, 0, 0.1)',
                        WebkitTextStroke: '0.3px rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {getPlatformName(link.platform)}
                    </div>
                  </div>

                  {/* Arrow with white background */}
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-1"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2.5}
                      style={{ color: textIconColor }}
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
          textColor={textColor}
          textSecondaryColor={textSecondaryColor}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flowFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          } 
          to { 
            opacity: 1; 
            transform: translateY(0);
          } 
        }
        
        @keyframes flowSlideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          } 
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          } 
        }
      ` }} />
    </div>
  );
}, areTemplatePropsEqual);
