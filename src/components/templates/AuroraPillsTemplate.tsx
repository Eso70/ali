"use client";

import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
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

export const AuroraPillsTemplate = memo(function AuroraPillsTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  const backgroundStyle = useMemo(
    () => ({
      background: theme.isSolid
        ? theme.from
        : `radial-gradient(circle at 20% 20%, ${theme.from}, transparent 35%), radial-gradient(circle at 80% 0%, ${theme.via}, transparent 35%), linear-gradient(135deg, ${theme.from}, ${theme.via}, ${theme.to})`,
    }),
    [theme.from, theme.via, theme.to, theme.isSolid],
  );

  const textColor = useMemo(() => deriveTextColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);
  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);

  const handleLinkClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick],
  );

  const linksWithColors = useMemo(() => {
    return links.map((link) => ({ link, colors: getPlatformColors(link.platform) }));
  }, [links]);

  return (
    <div className="relative w-full min-h-screen overflow-y-auto px-6 py-10" style={backgroundStyle}>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-3 h-24 w-24 rounded-2xl border border-white/30 bg-white/10 p-1 shadow-xl backdrop-blur">
            <Image
              src={profileImage}
              alt={linktree.name}
              fill
              className="rounded-xl object-cover"
              sizes="96px"
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
          <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: textColor }}>
            {linktree.name}
          </h1>
          <p className="text-sm mb-6" style={{ color: textSecondaryColor }}>
            {subtitle}
          </p>
        </div>

        <div className="space-y-3 mb-16" style={{ direction: "ltr" }}>
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
                  className="group relative flex w-full items-center gap-3 rounded-full px-5 py-4 shadow-lg backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                  style={{
                    background: `linear-gradient(120deg, ${colors.from}, ${colors.via}, ${colors.to})`,
                    border: "1px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                    animation: `fadeUp 0.45s ease-out ${index * 0.08}s both`,
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-inner">
                    {getPlatformIcon(link.platform, "w-5 h-5")}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold text-base leading-tight">{displayName}</div>
                    <div className="text-white/70 text-xs leading-tight">{getPlatformName(link.platform)}</div>
                  </div>
                  <div className="rounded-full border border-white/40 px-3 py-1 text-white/80 text-xs font-semibold transition group-hover:bg-white/15">
                    Go
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
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
}, areTemplatePropsEqual);
