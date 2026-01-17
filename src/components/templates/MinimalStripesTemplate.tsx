"use client";

import Image from "next/image";
import { memo, useMemo } from "react";
import { Footer } from "@/components/public/Footer";
import {
  getPlatformColors,
  getPlatformIcon,
  getPlatformName,
} from "@/components/public/LinktreeButtons";
import type { TemplateComponentProps } from "./types";
import { deriveTextSecondaryColor } from "@/lib/utils/theme-colors";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";

const FALLBACK_SUBTITLE = "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە";

export const MinimalStripesTemplate = memo(function MinimalStripesTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  const gradientBackground = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${theme.from}, ${theme.via}, ${theme.to})`,
    }),
    [theme.from, theme.via, theme.to],
  );

  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);

  const overlayStripes = useMemo(
    () => ({
      background: `repeating-linear-gradient(140deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 10px, transparent 10px, transparent 22px)`,
    }),
    [],
  );

  const socialLinks = useMemo(() => links.slice(0, 4), [links]);

  return (
    <div className="relative flex min-h-screen w-full justify-center overflow-y-auto px-3 py-10 pb-4">
      <div className="absolute inset-0" style={gradientBackground} aria-hidden />
      <div className="absolute inset-0 opacity-50" style={overlayStripes} aria-hidden />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-5 sm:gap-6 md:gap-8">
        <section className="w-full max-w-xl rounded-2xl sm:rounded-[28px] md:rounded-[32px] border border-white/30 bg-white/16 px-4 py-6 sm:px-5 sm:py-7 md:px-6 md:py-8 text-center backdrop-blur-3xl shadow-[0_26px_70px_rgba(15,12,45,0.32)]">
          <div className="relative mx-auto mb-5 sm:mb-6 md:mb-7 h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28">
            <div className="absolute inset-[-8px] sm:inset-[-9px] md:inset-[-10px] rounded-full border-2 sm:border-3 md:border-4 border-white/40 bg-white/12" aria-hidden />
            <div 
              className="relative h-full w-full overflow-hidden rounded-full border-2 sm:border-3 md:border-4 border-white/35 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                willChange: "auto"
              }}
            >
              <Image
                src={profileImage}
                alt={linktree.name}
                fill
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                className="object-cover"
                priority
                quality={75}
                onError={(e) => {
                  // Silently handle image load errors
                  const target = e.target as HTMLImageElement;
                  if (target.src !== profileImage) {
                    target.src = profileImage;
                  }
                }}
              />
            </div>
            <span 
              className="absolute -bottom-2 -right-2 sm:-bottom-2.5 sm:-right-2.5 md:-bottom-3 md:-right-3 inline-flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 items-center justify-center rounded-full border-2 sm:border-3 md:border-4 border-white text-white shadow-xl"
              style={{
                backgroundColor: theme.highlight || theme.accent || "#10b981",
              }}
            >
              •
            </span>
          </div>

          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.25)]">
            {linktree.name}
          </h1>
          <p className="mt-2 sm:mt-2.5 md:mt-3 mb-6 text-sm sm:text-base md:text-lg font-medium text-white/90">
            {subtitle}
          </p>
        </section>

        <section className="w-full max-w-xl space-y-3 sm:space-y-3.5 md:space-y-4 mb-16">
          {links.length === 0 ? (
            <p className="rounded-2xl sm:rounded-3xl border border-white/20 bg-white/15 px-4 py-4 sm:px-5 sm:py-4.5 md:px-6 md:py-5 text-center text-xs sm:text-sm text-white/80 backdrop-blur-2xl">
              هێشتا هیچ لینکێک نییە
            </p>
          ) : (
            links.map((link) => {
              const colors = getPlatformColors(link.platform);
              const icon = getPlatformIcon(link.platform, "h-4 w-4 sm:h-5 sm:w-5 text-white");
              const label = link.display_name || getPlatformName(link.platform);

              return (
                <button
                  key={link.id}
                  type="button"
                  dir="ltr"
                  onClick={() => onLinkClick(link.id, link.url, link.platform, link.default_message)}
                  className="group flex w-full items-center justify-between rounded-xl sm:rounded-[20px] md:rounded-[22px] bg-white/95 px-4 py-3.5 sm:px-5 sm:py-4 text-left shadow-[0_18px_36px_rgba(0,0,0,0.14)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(0,0,0,0.18)] focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  <span className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    <span
                      className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${colors.from}, ${colors.via}, ${colors.to})`,
                      }}
                    >
                      {icon}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                      {label}
                    </span>
                  </span>
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-all duration-300 group-hover:translate-x-2 group-hover:text-slate-700 flex-shrink-0 ml-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              );
            })
          )}
        </section>

        {socialLinks.length > 0 ? (
          <section className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5">
            {socialLinks.map((link) => (
              <button
                key={`${link.id}-social`}
                type="button"
                dir="ltr"
                onClick={() => onLinkClick(link.id, link.url, link.platform, link.default_message)}
                className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg transition-transform duration-300 hover:scale-110 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                {getPlatformIcon(link.platform, "h-4 w-4 sm:h-5 sm:w-5 text-slate-700")}
              </button>
            ))}
          </section>
        ) : null}

        <Footer 
          footerText={linktree.footer_text}
          footerPhone={linktree.footer_phone}
          footerHidden={linktree.footer_hidden ?? false}
          transparent={false}
          textColor="#ffffff"
          textSecondaryColor={textSecondaryColor}
        />
      </div>

      <style jsx>{`
      `}</style>
    </div>
  );
}, areTemplatePropsEqual);
