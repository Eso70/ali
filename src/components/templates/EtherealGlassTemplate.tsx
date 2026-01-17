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

export const EtherealGlassTemplate = memo(function EtherealGlassTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  // Ethereal flowing gradient background
  const backgroundStyle = useMemo(
    () => ({
      background: theme.isSolid
        ? theme.from
        : `linear-gradient(135deg, ${theme.from} 0%, ${theme.via} 35%, ${theme.to} 70%, ${theme.via} 100%)`,
    }),
    [theme.from, theme.via, theme.to, theme.isSolid],
  );

  // Detect white background
  const isWhiteBackground = useMemo(() => {
    return theme.isSolid 
      ? (theme.from === "#ffffff" || theme.from === "#f3f4f6" || theme.from === "#e5e7eb")
      : (theme.from.includes("fff") || theme.from.includes("f3f4f6") || theme.from.includes("e5e7eb"));
  }, [theme.from, theme.isSolid]);
  
  const textColor = useMemo(() => {
    if (isWhiteBackground) return "#1f2937";
    return deriveTextColor(theme.from, theme.via, theme.to);
  }, [isWhiteBackground, theme.from, theme.via, theme.to]);
  
  const textSecondaryColor = useMemo(() => {
    if (isWhiteBackground) return "#6b7280";
    return deriveTextSecondaryColor(theme.from, theme.via, theme.to);
  }, [isWhiteBackground, theme.from, theme.via, theme.to]);

  const handleClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick],
  );

  // Platform brand colors
  const getPlatformBrandColor = (platform: string): string => {
    const colors: Record<string, string> = {
      whatsapp: "#25D366",
      telegram: "#229ED9",
      viber: "#7360F2",
      phone: "#007AFF",
      instagram: "#833AB4",
      facebook: "#1877F2",
      twitter: "#000000",
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

  return (
    <div className="relative w-full min-h-screen overflow-y-auto px-4 py-8 sm:py-12" style={backgroundStyle}>
      {/* Animated gradient orbs - modern floating effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div 
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float-slow"
          style={{ background: theme.from }}
        />
        <div 
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float-slow-delayed"
          style={{ background: theme.to }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl animate-pulse-slow"
          style={{ background: theme.via }}
        />
      </div>
      
      <div className="relative w-full max-w-lg mx-auto">
        {/* Profile Section - Layered Glass Effect */}
        <div className="mb-10 relative" style={{ animation: "etherealFadeIn 0.8s ease-out" }}>
          {/* Background glass layer */}
          <div 
            className="absolute inset-0 rounded-[3rem] backdrop-blur-2xl"
            style={{
              background: isWhiteBackground 
                ? 'rgba(255, 255, 255, 0.6)'
                : 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${isWhiteBackground ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
              boxShadow: isWhiteBackground
                ? '0 8px 32px rgba(0, 0, 0, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}
          />
          
          {/* Content layer */}
          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col items-center text-center gap-5">
              {/* Avatar with 3D glow effect */}
              <div 
                className="relative mb-2"
              >
                <div 
                  className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full overflow-hidden"
                  style={{
                    boxShadow: `0 20px 60px ${theme.from}40, 0 0 0 4px ${isWhiteBackground ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.2)'}, inset 0 0 40px ${theme.via}20`,
                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                  }}
                >
                  <Image
                    src={profileImage}
                    alt={linktree.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 128px, 144px"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== profileImage) {
                        target.src = profileImage;
                      }
                    }}
                  />
                </div>
                {/* Glow ring */}
                <div 
                  className="absolute inset-0 rounded-full animate-pulse-glow"
                  style={{
                    background: `radial-gradient(circle, ${theme.via}30 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                    transform: 'scale(1.2)',
                    zIndex: -1,
                  }}
                />
              </div>

              {/* Name with modern typography */}
              <h1 
                className="text-4xl sm:text-5xl font-extrabold font-kurdish tracking-tight"
                style={{ 
                  color: textColor,
                  textShadow: isWhiteBackground 
                    ? '0 2px 10px rgba(0, 0, 0, 0.1)'
                    : `0 0 30px ${textColor}40, 0 2px 10px rgba(0, 0, 0, 0.3)`,
                  background: isWhiteBackground 
                    ? 'transparent'
                    : `linear-gradient(135deg, ${textColor}, ${textColor}dd)`,
                  WebkitBackgroundClip: isWhiteBackground ? 'initial' : 'text',
                  WebkitTextFillColor: isWhiteBackground ? textColor : 'transparent',
                }}
              >
                {linktree.name}
              </h1>

              {/* Subtitle with glass badge */}
              <div 
                className="inline-block px-6 py-3 rounded-full backdrop-blur-xl border font-kurdish"
                style={{
                  color: textSecondaryColor,
                  background: isWhiteBackground
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(255, 255, 255, 0.15)',
                  borderColor: isWhiteBackground
                    ? 'rgba(0, 0, 0, 0.1)'
                    : 'rgba(255, 255, 255, 0.3)',
                  boxShadow: isWhiteBackground
                    ? '0 4px 16px rgba(0, 0, 0, 0.05)'
                    : '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <p className="text-sm sm:text-base font-medium">{subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Links - Modern Floating Glass Cards */}
        <div className="space-y-4 mb-20" dir="ltr">
          {links.length === 0 ? (
            <div 
              className="rounded-2xl backdrop-blur-2xl p-8 text-center font-kurdish"
              style={{
                color: textSecondaryColor,
                background: isWhiteBackground
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${isWhiteBackground ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
                boxShadow: isWhiteBackground
                  ? '0 8px 32px rgba(0, 0, 0, 0.1)'
                  : '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <p className="text-sm">هێشتا هیچ لینکێک نییە</p>
            </div>
          ) : (
            links.map((link, idx) => {
              const colors = getPlatformColors(link.platform);
              const label = link.display_name || getPlatformName(link.platform);
              const icon = getPlatformIcon(link.platform, "w-6 h-6 sm:w-7 sm:h-7");
              const platformColor = getPlatformBrandColor(link.platform);

              return (
                <button
                  key={link.id}
                  onClick={() => handleClick(link.id, link.url, link.platform, link.default_message)}
                  className="group relative w-full rounded-2xl backdrop-blur-2xl border transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] ethereal-card"
                  style={{
                    background: `linear-gradient(135deg, ${colors.from}cc, ${colors.to}cc)`,
                    borderColor: `${colors.from}80`,
                    boxShadow: `0 10px 40px ${colors.from}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                    animation: `etherealSlideUp 0.6s ease-out ${0.1 + idx * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 20px 60px ${colors.from}60, 0 0 0 1px ${colors.from}60, inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 10px 40px ${colors.from}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`;
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  {/* Inner glow effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 30% 50%, ${colors.from}30, transparent 70%)`,
                    }}
                  />
                  
                  <div className="relative flex items-center gap-4 px-6 py-5">
                    {/* Icon with white background for platform color visibility */}
                    <div
                      className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      <div style={{ color: platformColor }}>
                        {icon}
                      </div>
                    </div>

                    {/* Label with platform color */}
                    <div className="flex-1 text-left min-w-0">
                      <div 
                        className="text-lg sm:text-xl font-bold truncate mb-1 font-kurdish"
                        style={{
                          color: platformColor,
                          textShadow: '0 0 10px rgba(255, 255, 255, 0.9), 0 2px 8px rgba(255, 255, 255, 0.7), 0 1px 3px rgba(0, 0, 0, 0.2)',
                          WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.8)',
                        }}
                      >
                        {label}
                      </div>
                      <div 
                        className="text-xs sm:text-sm font-medium font-kurdish"
                        style={{
                          color: platformColor,
                          opacity: 0.9,
                          textShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 1px 4px rgba(255, 255, 255, 0.6), 0 1px 2px rgba(0, 0, 0, 0.15)',
                          WebkitTextStroke: '0.3px rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        {getPlatformName(link.platform)}
                      </div>
                    </div>

                    {/* Modern arrow indicator */}
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 group-hover:translate-x-2 group-hover:scale-110"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={3}
                        style={{ color: platformColor }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
          transparent={true}
          textColor={textColor}
          textSecondaryColor={textSecondaryColor}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes etherealFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95);
          } 
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          } 
        }
        
        @keyframes etherealSlideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.9);
          } 
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          } 
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -30px) scale(1.1);
          }
        }
        
        @keyframes float-slow-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, 30px) scale(1.1);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.15;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        
        .animate-float-slow-delayed {
          animation: float-slow-delayed 25s ease-in-out infinite;
          animation-delay: -5s;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 15s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .ethereal-card {
          transform-style: preserve-3d;
        }
      ` }} />
    </div>
  );
}, areTemplatePropsEqual);
