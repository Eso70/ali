"use client";

import Image from "next/image";
import { memo, useMemo, useCallback } from "react";
import { Footer } from "@/components/public/Footer";
import { deriveTextSecondaryColor } from "@/lib/utils/theme-colors";
import {
  getPlatformColors,
  getPlatformIcon,
  getPlatformName,
} from "@/components/public/LinktreeButtons";
import type { TemplateComponentProps } from "./types";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";

const FALLBACK_SUBTITLE = "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە";

export const TerminalTemplate = memo(function TerminalTemplate({
  linktree,
  links,
  theme: _theme, // Not used - template has fixed colors
  onLinkClick,
}: TemplateComponentProps) {
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  // Terminal template uses fixed black background - doesn't use theme colors
  const backgroundGradient = useMemo(
    () => ({
      background: `linear-gradient(to bottom, #000000, #0a0a0a, #000000)`,
    }),
    [],
  );
  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor("#000000", "#0a0a0a", "#000000"), []);

  const handleLinkClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick]
  );

  return (
    <div 
      className="relative flex min-h-screen w-full justify-center overflow-y-auto px-4 py-8 pb-4 bg-black"
      style={{
        contain: "layout style paint",
      }}
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 opacity-20" style={backgroundGradient} aria-hidden />
      
      {/* Terminal Scanlines Effect */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)",
        }}
        aria-hidden
      />

      {/* ASCII Art Border Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h1v1H0zM39 0h1v1h-1zM0 39h1v1H0zM39 39h1v1h-1z' fill='%2300ff00'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div 
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-4 sm:gap-5 md:gap-6"
        style={{ contain: "layout style paint" }}
      >
        {/* Terminal Header */}
        <div 
          className="w-full text-left bg-black/80 backdrop-blur-sm p-3 sm:p-4"
          style={{ border: `1px solid rgba(34, 197, 94, 0.5)` }} // Fixed green border
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#10b981" }} // Fixed green
              ></div>
            </div>
            <span 
              className="text-xs font-mono"
              style={{ color: "#34d399" }} // Fixed green
            >terminal@linktree:~$</span>
          </div>
          <div 
            className="text-xs font-mono"
            style={{ color: "#34d399" }} // Fixed green
          >
            <span style={{ color: "#10b981" }}>$</span> cat profile.txt
          </div>
        </div>

        {/* Profile Section */}
        <div className="text-center w-full">
          <div className="relative inline-block mb-3 sm:mb-4 md:mb-5">
            <div 
              className="relative rounded-full overflow-hidden border-2"
              style={{
                borderColor: "#10b981", // Fixed green
                boxShadow: `0 0 10px #10b98180`, // Fixed green
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                willChange: "auto",
              }}
            >
              <Image
                src={profileImage}
                alt={linktree.name}
                width={120}
                height={120}
                quality={75}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover"
                onError={(e) => {
                  // Silently handle image load errors
                  const target = e.target as HTMLImageElement;
                  if (target.src !== profileImage) {
                    target.src = profileImage;
                  }
                }}
              />
            </div>
          </div>

          {/* Name with Terminal Style */}
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3"
            style={{
              fontFamily: "monospace",
              color: "#34d399", // Fixed green
              textShadow: `0 0 10px #34d399cc, 0 0 20px #34d39966`, // Fixed green
              letterSpacing: "0.05em",
            }}
          >
            {linktree.name}
          </h1>

          {/* Subtitle */}
          <p 
            className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 font-kurdish"
            style={{
              fontFamily: "monospace",
              color: "rgba(134, 239, 172, 1)", // Fixed green
              textShadow: `0 0 5px #34d39980`, // Fixed green
              letterSpacing: "0.02em",
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Terminal Command Section */}
        <div 
          className="w-full bg-black/80 backdrop-blur-sm p-3 sm:p-4"
          style={{ border: `1px solid rgba(34, 197, 94, 0.5)` }} // Fixed green border
        >
          <div 
            className="text-xs font-mono mb-3"
            style={{ color: "#34d399" }} // Fixed green
          >
            <span style={{ color: "#10b981" }}>$</span> ls -la links/
          </div>

          {/* Links Section */}
          <div className="w-full flex flex-col gap-2 sm:gap-2.5">
            {links.length === 0 ? (
              <div className="text-center py-8">
                <p 
                  className="font-kurdish text-sm sm:text-base font-mono"
                  style={{ color: "rgba(16, 185, 129, 0.6)" }} // Fixed green
                >هیچ لینکێک نییە</p>
              </div>
            ) : (
              links.map((link, index) => {
                const colors = getPlatformColors(link.platform);
                const icon = getPlatformIcon(link.platform, "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6");
                const platformName = getPlatformName(link.platform);
                const label = link.display_name || platformName;

                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id, link.url, link.platform, link.default_message)}
                    className="group relative w-full text-left px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 transition-all duration-200"
                    style={{
                      border: `1px solid rgba(34, 197, 94, 0.3)`, // Fixed green border
                      background: `linear-gradient(90deg, ${colors.from}15, ${colors.via}20, ${colors.to}15)`,
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                      willChange: "transform",
                      contain: "layout style paint",
                    }}
                    onMouseEnter={(e) => {
                      // Fixed green hover
                      e.currentTarget.style.borderColor = "#10b981";
                      e.currentTarget.style.backgroundColor = `rgba(16, 185, 129, 0.1)`;
                      e.currentTarget.style.boxShadow = `0 0 10px rgba(16, 185, 129, 0.3)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'; // Fixed green
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
                      {/* File Type Indicator */}
                      <div 
                        className="flex-shrink-0 font-mono text-xs"
                        style={{ color: "#10b981" }} // Fixed green
                      >
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      {/* Icon */}
                      <div 
                        className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/50 flex items-center justify-center"
                        style={{
                          border: `1px solid rgba(34, 197, 94, 0.3)`, // Fixed green border
                          transform: "translateZ(0)",
                          backfaceVisibility: "hidden",
                        }}
                      >
                        {icon}
                      </div>
                      
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div 
                          className="text-sm sm:text-base md:text-lg font-bold truncate font-mono"
                          style={{
                            color: "#34d399", // Fixed green
                            textShadow: `0 0 5px #34d3994d`, // Fixed green
                          }}
                        >
                          {label}
                        </div>
                        {link.description && (
                          <div 
                            className="text-xs sm:text-sm truncate mt-1.5 sm:mt-1 font-mono"
                            style={{
                              color: "rgba(16, 185, 129, 0.7)", // Fixed green
                              textShadow: `0 0 3px #10b98133`, // Fixed green
                            }}
                          >
                            {link.description}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div 
                        className="flex-shrink-0 font-mono"
                        style={{
                          color: "#10b981", // Fixed green
                          textShadow: `0 0 5px #10b98180`, // Fixed green
                        }}
                      >
                        →
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer 
          footerText={linktree.footer_text}
          footerPhone={linktree.footer_phone}
          footerHidden={linktree.footer_hidden ?? false}
          transparent={false}
          textColor="#00ff00"
          textSecondaryColor={textSecondaryColor}
        />
      </div>
    </div>
  );
}, areTemplatePropsEqual);
