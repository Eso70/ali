"use client";

import Image from "next/image";
import { Linktree } from "@/lib/supabase/queries";
import { memo, useMemo } from "react";

interface LinktreeHeaderProps {
  linktree: Linktree;
  textColor?: string;
  textSecondaryColor?: string;
}

export const LinktreeHeader = memo(function LinktreeHeader({
  linktree,
  textColor = "#ffffff",
  textSecondaryColor = "rgba(255, 255, 255, 0.8)",
}: LinktreeHeaderProps) {
  const glowStyle = useMemo(() => {
    let primaryColor = linktree.background_color || "#6366f1";

    if (primaryColor && primaryColor.startsWith("{")) {
      try {
        const parsed = JSON.parse(primaryColor);
        if (parsed.type === "gradient" && parsed.primaryColor) {
          primaryColor = parsed.primaryColor;
        }
      } catch {
        primaryColor = "#6366f1";
      }
    }

    return {
      background: `radial-gradient(circle at 50% 40%, ${primaryColor}60, ${primaryColor}30, transparent 55%)`,
    };
  }, [linktree.background_color]);

  // Use default avatar if no image is set
  const imageSrc = linktree.image || "/images/DefaultAvatar.png";

  return (
    <header className="w-full px-3 sm:px-4">
      <div className="relative flex flex-col items-center gap-4 sm:gap-6 text-center">
        <div 
          className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden"
          }}
        >
          <div 
            className="absolute inset-0 rounded-full border border-white/15 bg-white/10 shadow-lg sm:shadow-xl" 
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden"
            }}
            aria-hidden 
          />
          <div 
            className="absolute inset-0 rounded-full opacity-40 sm:opacity-45 md:opacity-50 blur-md sm:blur-lg" 
            style={{
              ...glowStyle,
              transform: "translateZ(0)",
              backfaceVisibility: "hidden"
            }} 
            aria-hidden 
          />
          <div 
            className="relative h-full w-full overflow-hidden rounded-full border border-white/30 bg-gray-900 shadow-xl sm:shadow-2xl"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              willChange: "auto"
            }}
          >
            <Image
              src={imageSrc}
              alt={linktree.name}
              width={112}
              height={112}
              className="h-full w-full object-cover"
              priority
              loading="eager"
              sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
              quality={75}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onError={(e) => {
                // Silently handle image load errors
                const target = e.target as HTMLImageElement;
                if (target.src !== imageSrc) {
                  target.src = imageSrc;
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2 md:space-y-3">
          <h1 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-balance px-2"
            style={{ 
              color: textColor,
              textShadow: textColor === "#ffffff" 
                ? "0 4px 16px rgba(0,0,0,0.3), 0 5px 20px rgba(0,0,0,0.32), 0 6px 24px rgba(0,0,0,0.35)"
                : "0 2px 8px rgba(255,255,255,0.3), 0 3px 12px rgba(255,255,255,0.2)"
            }}
          >
            {linktree.name}
          </h1>
          <p 
            className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-xl text-pretty px-2 mb-6"
            style={{ color: textSecondaryColor }}
          >
            {linktree.subtitle || "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە"}
          </p>
          <div
            className="pt-1 sm:pt-1.5 md:pt-2 text-base sm:text-lg md:text-xl arrow-bounce"
            style={{ color: textSecondaryColor }}
            aria-hidden
          >
            👇
          </div>
        </div>
      </div>
    </header>
  );
});
