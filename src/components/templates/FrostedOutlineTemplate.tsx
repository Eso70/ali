"use client";

import { memo, useCallback, useMemo } from "react";
import { LinktreeHeader } from "@/components/public/LinktreeHeader";
import { getPlatformIcon, getPlatformName, getPlatformColors } from "@/components/public/LinktreeButtons";
import type { TemplateComponentProps } from "./types";
import { deriveTextColor, deriveTextSecondaryColor } from "@/lib/utils/theme-colors";
import { Footer } from "@/components/public/Footer";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";

export const FrostedOutlineTemplate = memo(function FrostedOutlineTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const backgroundStyle = useMemo(
    () => ({
      background: theme.isSolid
        ? theme.from
        : `linear-gradient(145deg, ${theme.from}, ${theme.via}, ${theme.to})`,
    }),
    [theme.from, theme.via, theme.to, theme.isSolid],
  );

  const textColor = useMemo(() => deriveTextColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);
  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);

  const handleClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick],
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-y-auto px-4 py-10" style={backgroundStyle}>
      <div className="w-full max-w-md mx-auto">
        <LinktreeHeader linktree={linktree} textColor={textColor} textSecondaryColor={textSecondaryColor} />

        <div className="mt-6 flex flex-col gap-3 mb-16">
          {links.length === 0 ? (
            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-6 text-center text-sm" style={{ color: textSecondaryColor }}>
              هێشتا هیچ لینکێک نییە
            </div>
          ) : (
            links.map((link, idx) => {
              const colors = getPlatformColors(link.platform);
              const icon = getPlatformIcon(link.platform, "w-6 h-6");
              const label = link.display_name || getPlatformName(link.platform);

              return (
                <button
                  key={link.id}
                  type="button"
                  dir="ltr"
                  onClick={() => handleClick(link.id, link.url, link.platform, link.default_message)}
                  className="group relative flex items-center gap-3 rounded-2xl px-4 py-4 backdrop-blur-md transition duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.15)",
                    animation: `riseIn 0.45s ease-out ${idx * 0.07}s both`,
                  }}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-inner"
                    style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.via}, ${colors.to})` }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-base font-semibold" style={{ color: textColor }}>
                      {label}
                    </div>
                    <div className="text-xs" style={{ color: textSecondaryColor }}>
                      {getPlatformName(link.platform)}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white/80 transition group-hover:bg-white/10">
                    OPEN
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(120deg, ${colors.from}30, transparent, ${colors.to}30)`,
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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes riseIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
}, areTemplatePropsEqual);
