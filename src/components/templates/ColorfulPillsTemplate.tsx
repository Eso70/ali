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

export const ColorfulPillsTemplate = memo(function ColorfulPillsTemplate({
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

  const textColor = useMemo(() => deriveTextColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);
  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);

  const handleLinkClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick]
  );

  // Get platform colors for each link
  const linksWithColors = useMemo(() => {
    return links.map((link) => {
      const colors = getPlatformColors(link.platform);
      return { link, colors };
    });
  }, [links]);

  const _renderColorfulName = useCallback((name: string) => {
    const palette = [
      "text-blue-600",
      "text-blue-500",
      "text-cyan-500",
      "text-blue-400",
      "text-blue-600",
      "text-cyan-400",
      "text-blue-500",
      "text-blue-600",
    ];

    return name.split("").map((char, index) => {
      if (char === " ") {
        return <span key={`${index}-space`} className="inline-block w-1" />;
      }

      return (
        <span
          key={`${index}-${char}`}
          className={`${palette[index % palette.length]} font-semibold text-base sm:text-lg`}
        >
          {char}
        </span>
      );
    });
  }, []);

  return (
    <div 
      className="relative w-full min-h-screen overflow-y-auto py-12 px-6"
      style={backgroundStyle}
    >
      <div className="w-full max-w-md mx-auto">
        {/* Profile Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
              <Image
                src={profileImage}
                alt={linktree.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
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
          
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: textColor }}
          >
            {linktree.name}
          </h1>
          <p 
            className="text-sm mb-6"
            style={{ color: textSecondaryColor }}
          >
            {subtitle}
          </p>
        </div>

        {/* Colorful Pill Links */}
        <div className="space-y-4 mb-16" style={{ direction: "ltr" }}>
          {linksWithColors.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: textSecondaryColor }}>هێشتا هیچ لینکێک نییە</p>
            </div>
          ) : (
            linksWithColors.map(({ link, colors }, index) => {
              const displayName = link.display_name || getPlatformName(link.platform);
              
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleLinkClick(link.id, link.url, link.platform, link.default_message)}
                  className="group block w-full bg-gradient-to-r rounded-full px-6 py-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(to right, ${colors.from}, ${colors.via}, ${colors.to})`,
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {getPlatformIcon(link.platform, "w-6 h-6 text-white")}
                    </div>
                    <span className="text-white font-semibold text-lg">
                      {displayName}
                    </span>
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
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      ` }} />
    </div>
  );
}, areTemplatePropsEqual);
