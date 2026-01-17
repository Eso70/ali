"use client";

import Image from "next/image";
import { memo, useMemo, useCallback } from "react";
import { Footer } from "@/components/public/Footer";
import { deriveTextSecondaryColor } from "@/lib/utils/theme-colors";
import {
  getPlatformIcon,
  getPlatformName,
} from "@/components/public/LinktreeButtons";
import type { TemplateComponentProps } from "./types";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";

const FALLBACK_SUBTITLE = "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە";

export const PaperCutTemplate = memo(function PaperCutTemplate({
  linktree,
  links,
  theme: _theme, // Not used - template has fixed colors
  onLinkClick,
}: TemplateComponentProps) {
  // PaperCut template uses fixed paper art colors - doesn't use theme colors
  const backgroundStyle = useMemo(
    () => ({
      background: `linear-gradient(to bottom right, #fef3c7, #fde68a, #fef3c7)`, // Warm paper tones
    }),
    [],
  );
  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor("#fef3c7", "#fde68a", "#fef3c7"), []);
  const profileImage = useMemo(() => linktree.image || "/images/DefaultAvatar.png", [linktree.image]);
  const subtitle = useMemo(() => linktree.subtitle?.trim() || FALLBACK_SUBTITLE, [linktree.subtitle]);

  const handleLinkClick = useCallback(
    (linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
      onLinkClick(linkId, url, platform, defaultMessage);
    },
    [onLinkClick]
  );

  // Generate random rotations for paper cut effect
  const linkRotations = useMemo(() => {
    return links.map((_, index) => {
      const rotations = [-3, -2, -1, 1, 2, 3];
      return rotations[index % rotations.length];
    });
  }, [links]);

  return (
    <div 
      className="relative flex min-h-screen w-full justify-center overflow-y-auto px-4 py-12 pb-4"
      style={backgroundStyle}
    >
      {/* Paper Texture Background */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
        aria-hidden
      />

      {/* Decorative Paper Cuts at Top */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden pointer-events-none" aria-hidden>
        <svg viewBox="0 0 1200 100" className="w-full h-full" preserveAspectRatio="none">
          <path 
            d="M0,0 L0,80 Q100,60 200,80 T400,80 T600,80 T800,80 T1000,80 T1200,80 L1200,0 Z" 
            fill="#fff"
            opacity="0.9"
          />
        </svg>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8">
        {/* Profile Card - Paper Cut Style */}
        <div 
          className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 w-full relative"
          style={{
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.9)',
            transform: 'rotate(-0.5deg)'
          }}
        >
          {/* Decorative Corner Cuts */}
          <div className="absolute top-0 right-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-orange-100 transform rotate-45 translate-x-3 -translate-y-3 sm:translate-x-4 sm:-translate-y-4" aria-hidden />
          <div className="absolute bottom-0 left-0 w-5 h-5 sm:w-6 sm:h-6 bg-rose-100 rounded-full transform -translate-x-2.5 translate-y-2.5 sm:-translate-x-3 sm:translate-y-3" aria-hidden />

          <div className="text-center relative">
            {/* Avatar with Paper Effect */}
            <div className="relative inline-block mb-4 sm:mb-5 md:mb-6">
              <div 
                className="absolute inset-0 bg-gradient-to-br from-orange-200 to-rose-200 rounded-full" 
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                }}
                aria-hidden 
              />
              <div 
                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 sm:border-3 md:border-4 border-white shadow-lg overflow-hidden"
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
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
              {/* Paper Cut Accent - Star */}
              <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 w-10 h-10 sm:w-12 sm:h-12" aria-hidden>
                <svg viewBox="0 0 50 50" className="w-full h-full">
                  <path 
                    d="M25,5 L30,15 L40,15 L32,22 L35,32 L25,26 L15,32 L18,22 L10,15 L20,15 Z" 
                    fill="#f59e0b"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            
            <h1 
              className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1.5 sm:mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {linktree.name}
            </h1>
            <div className="inline-block bg-gradient-to-r from-orange-100 to-rose-100 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full mb-6 transform -rotate-1">
              <p className="text-xs sm:text-sm font-semibold text-orange-800">
                {subtitle}
              </p>
            </div>

            {/* Decorative Divider with Scissors */}
            <div className="flex items-center justify-center gap-2 mt-4" aria-hidden>
              <div className="w-8 h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
              <svg 
                className="w-4 h-4 text-orange-400"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
              <div className="w-8 h-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
            </div>
          </div>
        </div>

        {/* Links - Paper Cards */}
        <div className="space-y-3 sm:space-y-4 w-full mb-16">
          {links.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-center shadow-md">
              <p className="text-gray-600 text-xs sm:text-sm">هێشتا هیچ لینکێک نییە</p>
            </div>
          ) : (
            links.map((link, index) => {
              const icon = getPlatformIcon(link.platform, "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-600");
              const label = link.display_name || getPlatformName(link.platform);
              const rotation = linkRotations[index] || 0;

              return (
                <button
                  key={link.id}
                  type="button"
                  dir="ltr"
                  onClick={() => handleLinkClick(link.id, link.url, link.platform, link.default_message)}
                  className="group block bg-white rounded-xl sm:rounded-2xl p-4 sm:p-4.5 md:p-5 w-full transition-all duration-200 sm:duration-300 active:scale-[0.98] sm:hover:shadow-xl"
                  style={{
                    boxShadow: '0 4px 15px -5px rgba(0,0,0,0.1)',
                    transform: `translate3d(0, 0, 0) rotate(${rotation}deg)`,
                    contain: "layout style paint",
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                      e.currentTarget.style.transform = `translate3d(0, -5px, 0) rotate(${rotation}deg)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                      e.currentTarget.style.transform = `translate3d(0, 0, 0) rotate(${rotation}deg)`;
                    }
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-rose-200 rounded-lg sm:rounded-xl transform rotate-6" aria-hidden />
                      <div className="relative w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-md border-2 border-orange-100">
                        {icon}
                      </div>
                    </div>
                    <span className="text-gray-800 font-semibold text-sm sm:text-base md:text-lg flex-1 text-left min-w-0 truncate">
                      {label}
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
          transparent={false}
          textColor="#1f2937"
          textSecondaryColor={textSecondaryColor}
        />
      </div>

      <style jsx>{`
      `}</style>
    </div>
  );
}, areTemplatePropsEqual);
