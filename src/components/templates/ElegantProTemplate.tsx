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

export const ElegantProTemplate = memo(function ElegantProTemplate({
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
        : `radial-gradient(circle at 20% 20%, ${theme.from}80, transparent 35%), radial-gradient(circle at 80% 10%, ${theme.via}70, transparent 35%), linear-gradient(135deg, ${theme.from}, ${theme.via}, ${theme.to})`,
    }),
    [theme.from, theme.via, theme.to, theme.isSolid],
  );

  const cardGlass = useMemo(
    () => ({
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.18)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    }),
    [],
  );

  const textColor = useMemo(() => deriveTextColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);
  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);

  const handleClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick],
  );

  const linksWithColors = useMemo(() => links.map((link) => ({ link, colors: getPlatformColors(link.platform) })), [links]);

  return (
    <div className="relative w-full min-h-screen overflow-y-auto px-5 py-10" style={backgroundStyle}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.12),transparent_40%)]" aria-hidden />
      <div className="relative w-full max-w-xl mx-auto">
        <div className="rounded-[28px] p-6 sm:p-8 backdrop-blur-xl" style={cardGlass}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl overflow-hidden border border-white/30 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
              <Image
                src={profileImage}
                alt={linktree.name}
                fill
                className="object-cover"
                sizes="112px"
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
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: textColor }}>
                {linktree.name}
              </h1>
              <p className="text-sm sm:text-base mb-6" style={{ color: textSecondaryColor }}>
                {subtitle}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 mb-16" dir="ltr">
            {linksWithColors.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: textSecondaryColor }}>
                هێشتا هیچ لینکێک نییە
              </div>
            ) : (
              linksWithColors.map(({ link, colors }, idx) => {
                const label = link.display_name || getPlatformName(link.platform);
                return (
                  <button
                    key={link.id}
                    onClick={() => handleClick(link.id, link.url, link.platform, link.default_message)}
                    className="group relative flex w-full items-center gap-3 rounded-2xl px-4 py-4 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      boxShadow: "0 14px 36px rgba(0,0,0,0.18)",
                      animation: `riseIn 0.45s ease-out ${idx * 0.07}s both`,
                    }}
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-inner"
                      style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.via}, ${colors.to})` }}
                    >
                      {getPlatformIcon(link.platform, "w-6 h-6")}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-base font-semibold truncate" style={{ color: textColor }}>
                        {label}
                      </div>
                      <div className="text-xs" style={{ color: textSecondaryColor }}>
                        {getPlatformName(link.platform)}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/40 px-3 py-1 text-xs font-semibold text-white/80 transition group-hover:bg-white/10">
                      Open
                    </div>
                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(120deg, ${colors.from}30, transparent, ${colors.to}30)`
                      }}
                    />
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
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes riseIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
}, areTemplatePropsEqual);
