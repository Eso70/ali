"use client";

import Image from "next/image";
import { memo, useMemo, useCallback } from "react";
import {
  getPlatformIcon,
  getPlatformName,
} from "@/components/public/LinktreeButtons";
import type { TemplateComponentProps } from "./types";
import { Footer } from "@/components/public/Footer";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";
import { deriveTextColor, deriveTextSecondaryColor } from "@/lib/utils/theme-colors";

// Helper to calculate brightness from hex
function getBrightness(hex: string): number {
  const rgb = hex.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!rgb) return 128;
  const r = parseInt(rgb[1], 16);
  const g = parseInt(rgb[2], 16);
  const b = parseInt(rgb[3], 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

const FALLBACK_SUBTITLE = "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە";

export const HeroImageTemplate = memo(function HeroImageTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  // Get background gradient from theme
  const backgroundStyle = useMemo(
    () => ({
      background: theme.isSolid 
        ? theme.from 
        : `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`,
    }),
    [theme.from, theme.via, theme.to, theme.isSolid],
  );

  // Detect if background is white/light
  const isWhiteBackground = useMemo(() => {
    if (theme.isSolid) {
      const brightness = getBrightness(theme.from);
      return brightness > 200 || theme.from === "#ffffff" || theme.from === "#f3f4f6" || theme.from === "#e5e7eb";
    }
    // For gradients, check if any color is white/light
    const fromBrightness = getBrightness(theme.from);
    const viaBrightness = getBrightness(theme.via);
    const toBrightness = getBrightness(theme.to);
    const avgBrightness = (fromBrightness + viaBrightness + toBrightness) / 3;
    return avgBrightness > 200 || 
           theme.from.includes("fff") || theme.from.includes("f3f4f6") || theme.from.includes("e5e7eb") ||
           theme.via.includes("fff") || theme.via.includes("f3f4f6") || theme.via.includes("e5e7eb") ||
           theme.to.includes("fff") || theme.to.includes("f3f4f6") || theme.to.includes("e5e7eb");
  }, [theme.from, theme.via, theme.to, theme.isSolid]);

  // Text colors - adapt to background
  const textColor = useMemo(() => {
    if (isWhiteBackground) return "#1f2937"; // gray-800 for white backgrounds
    return deriveTextColor(theme.from, theme.via, theme.to);
  }, [isWhiteBackground, theme.from, theme.via, theme.to]);
  
  const textSecondaryColor = useMemo(() => {
    if (isWhiteBackground) return "#6b7280"; // gray-500 for white backgrounds
    return deriveTextSecondaryColor(theme.from, theme.via, theme.to);
  }, [isWhiteBackground, theme.from, theme.via, theme.to]);

  // Determine fade color for image gradient - use theme's "to" color or derive from background
  const fadeColor = useMemo(() => {
    if (isWhiteBackground) {
      return "rgba(255, 255, 255, 1)";
    }
    // For dark backgrounds, use the theme's "to" color
    const rgb = theme.to.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (rgb) {
      const r = parseInt(rgb[1], 16);
      const g = parseInt(rgb[2], 16);
      const b = parseInt(rgb[3], 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return theme.to;
  }, [theme.to, isWhiteBackground]);

  const handleClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick],
  );

  // Platform brand colors function
  const getPlatformBrandColor = (platform: string): string => {
    const colors: Record<string, string> = {
      whatsapp: "#25D366",
      telegram: "#229ED9",
      viber: "#7360F2",
      phone: "#007AFF",
      instagram: "#833AB4",
      facebook: "#1877F2",
      twitter: "#1DA1F2",
      x: "#000000",
      linkedin: "#0A66C2",
      snapchat: "#FFFC00",
      tiktok: "#000000",
      youtube: "#FF0000",
      discord: "#5865F2",
      email: "#1A73E8",
      website: "#2563EB",
      custom: "#6B7280",
    };
    return colors[platform] || colors.custom;
  };

  // Get first 8 links for icon row (expandable for more links)
  const iconLinks = useMemo(() => links.slice(0, 8), [links]);
  // Remaining links as buttons below
  const remainingLinks = useMemo(() => links.slice(8), [links]);

  return (
    <div className="relative w-full min-h-screen overflow-y-auto" style={backgroundStyle}>
      {/* Hero Image Section - Full width, Half viewport height */}
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src={profileImage}
          alt={linktree.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== profileImage) {
              target.src = profileImage;
            }
          }}
        />
        
        {/* Shadow and fade gradient at bottom of image - adapts to background */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${fadeColor}40 50%, ${fadeColor}80 80%, ${fadeColor} 100%)`,
          }}
        />
      </div>

      {/* Content Section Below Image - Theme Background */}
      <div className="relative px-4 sm:px-6 py-6 sm:py-8" style={backgroundStyle}>
        <div className="w-full max-w-md mx-auto">
          {/* Profile Info - Name and Subtitle */}
          <div className="text-center mb-8" style={{ animation: "heroFadeIn 0.8s ease-out" }}>
            {/* Name - Distinct design with border/underline */}
            <div className="mb-4">
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 font-kurdish inline-block"
                style={{
                  color: textColor,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  textShadow: isWhiteBackground 
                    ? '0 2px 10px rgba(0, 0, 0, 0.1)' 
                    : `0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 10px ${textColor}30`,
                  borderBottom: `3px solid ${isWhiteBackground ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`,
                  paddingBottom: '12px',
                }}
              >
                {linktree.name}
              </h1>
            </div>
            {/* Subtitle - Different style, more subtle */}
            <p 
              className="text-base sm:text-lg md:text-xl font-kurdish"
              style={{
                color: textSecondaryColor,
                fontWeight: 300,
                letterSpacing: '0.01em',
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Social Media Icons Row - With platform colors */}
          {iconLinks.length > 0 && (
            <div className="flex justify-center items-center gap-5 sm:gap-7 md:gap-8 flex-wrap mb-16" dir="ltr">
              {iconLinks.map((link) => {
                const icon = getPlatformIcon(link.platform, "w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11");
                const platformColor = getPlatformBrandColor(link.platform);
                const isDarkPlatform = link.platform === "twitter" || link.platform === "x" || link.platform === "tiktok";
                const shadowColor = isWhiteBackground ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.4)';
                
                return (
                  <button
                    key={link.id}
                    onClick={() => handleClick(link.id, link.url, link.platform, link.default_message)}
                    className="relative transition-all duration-300 hover:scale-110 active:scale-95 p-2"
                    style={{
                      color: isDarkPlatform ? (isWhiteBackground ? '#000000' : '#ffffff') : platformColor,
                      filter: `drop-shadow(0 3px 10px ${shadowColor})`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                      e.currentTarget.style.filter = `drop-shadow(0 6px 16px ${platformColor}70)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.filter = `drop-shadow(0 3px 10px ${shadowColor})`;
                    }}
                    aria-label={getPlatformName(link.platform)}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
          )}

          {/* Remaining Links as Buttons (if more than 8 links) */}
          {remainingLinks.length > 0 && (
            <div className="space-y-3 mb-24" dir="ltr">
              {remainingLinks.map((link, idx) => {
                const label = link.display_name || getPlatformName(link.platform);
                const icon = getPlatformIcon(link.platform, "w-5 h-5 sm:w-6 sm:h-6");
                const platformColor = getPlatformBrandColor(link.platform);
                const isDarkPlatform = link.platform === "twitter" || link.platform === "x" || link.platform === "tiktok";

                // Button background adapts to light/dark backgrounds
                const buttonBg = isWhiteBackground 
                  ? 'rgba(0, 0, 0, 0.05)' 
                  : 'rgba(0, 0, 0, 0.3)';
                const buttonBgHover = isWhiteBackground 
                  ? 'rgba(0, 0, 0, 0.1)' 
                  : 'rgba(0, 0, 0, 0.5)';
                const buttonBorder = isWhiteBackground 
                  ? 'rgba(0, 0, 0, 0.15)' 
                  : 'rgba(255, 255, 255, 0.15)';

                return (
                  <button
                    key={link.id}
                    onClick={() => handleClick(link.id, link.url, link.platform, link.default_message)}
                    className="group w-full flex items-center gap-4 rounded-xl px-5 py-4 backdrop-blur-sm border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: buttonBg,
                      borderColor: buttonBorder,
                      animation: `heroSlideUp 0.6s ease-out ${0.1 + idx * 0.05}s both`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = buttonBgHover;
                      e.currentTarget.style.borderColor = `${platformColor}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = buttonBg;
                      e.currentTarget.style.borderColor = buttonBorder;
                    }}
                  >
                    {/* Icon with platform color */}
                    <div 
                      className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                      style={{
                        color: isDarkPlatform ? (isWhiteBackground ? '#000000' : '#ffffff') : platformColor,
                        background: isWhiteBackground ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                        border: `1px solid ${platformColor}40`,
                      }}
                    >
                      {icon}
                    </div>

                    {/* Label */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-base sm:text-lg font-semibold truncate font-kurdish" style={{ color: textColor }}>
                        {label}
                      </div>
                      <div className="text-xs font-medium font-kurdish" style={{ color: textSecondaryColor }}>
                        {getPlatformName(link.platform)}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex h-8 w-8 items-center justify-center">
                      <svg 
                        className="w-4 h-4 transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2.5}
                        style={{ color: textSecondaryColor }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = textColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = textSecondaryColor;
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {links.length === 0 && (
            <div className="text-center py-8 mb-24">
              <p className="text-sm font-kurdish" style={{ color: textSecondaryColor }}>هێشتا هیچ لینکێک نییە</p>
            </div>
          )}

          {/* Footer - Lower and Smaller */}
          <div className="mt-24 mb-8" style={{ fontSize: '0.85rem' }}>
            <div style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
              <Footer 
                footerText={linktree.footer_text}
                footerPhone={linktree.footer_phone}
                footerHidden={linktree.footer_hidden ?? false}
                transparent={true}
                textColor={textColor}
                textSecondaryColor={textSecondaryColor}
              />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes heroFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          } 
          to { 
            opacity: 1; 
            transform: translateY(0);
          } 
        }
        
        @keyframes heroSlideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
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
