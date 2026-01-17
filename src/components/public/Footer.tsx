"use client";

import { memo, useCallback } from "react";
import type { MouseEvent } from "react";
import { SPONSOR_TEXT, DEFAULT_FOOTER_NAME, DEFAULT_FOOTER_PHONE } from "@/lib/constants/footer";

interface FooterProps {
  footerText?: string | null;
  footerPhone?: string | null;
  footerHidden?: boolean;
  transparent?: boolean;
  textColor?: string;
  textSecondaryColor?: string;
}

export const Footer = memo(function Footer({
  footerText,
  footerPhone,
  footerHidden = false,
  transparent: _transparent = false,
  textColor = "#ffffff",
  textSecondaryColor = "rgba(255, 255, 255, 0.7)",
}: FooterProps) {
  // Use footerPhone from database if present, otherwise default to configured number
  const phoneNumber = footerPhone?.trim() || DEFAULT_FOOTER_PHONE;
  // Ensure phone number has country code format (add + if missing, but wa.me doesn't need +)
  const cleanPhone = phoneNumber.startsWith("+") ? phoneNumber.slice(1) : phoneNumber;
  
  // Hooks must be called before any early returns
  const handleSarfrazWhatsApp = useCallback((e: MouseEvent<HTMLButtonElement | HTMLParagraphElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const whatsappUrl = `https://wa.me/${cleanPhone}`;

    // Always open WhatsApp chat in a new tab to avoid duplicate targets
    try {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Ignore popup blockers; user can tap again
    }
  }, [cleanPhone]);

  // Don't render footer if hidden (after hooks)
  if (footerHidden) {
    return null;
  }
  
  const sponsorText = SPONSOR_TEXT; // Always fixed sponsor text
  const nameText = footerText?.trim() || DEFAULT_FOOTER_NAME; // Clickable admin-configured name

  // Detect if background is light (white/light colors) or dark
  // If textColor is white (#ffffff), it means dark background. Otherwise, it's likely a light background.
  const isLightBackground = textColor !== "#ffffff" && textColor !== "#00ff00"; // Exclude terminal green too
  
  // Adjust colors based on background
  const buttonBorderColor = isLightBackground ? "rgba(239, 68, 68, 0.6)" : "rgba(248, 113, 113, 0.7)"; // red-500/60 for light, red-400/70 for dark
  const buttonBorderHoverColor = isLightBackground ? "rgba(239, 68, 68, 0.8)" : "rgba(248, 113, 113, 0.9)";
  const buttonTextColor = isLightBackground ? "#dc2626" : "#f87171"; // red-600 for light, red-400 for dark
  const gradientFrom = isLightBackground ? "rgba(239, 68, 68, 0.15)" : "rgba(248, 113, 113, 0.1)"; // Slightly stronger on light bg
  const gradientVia = isLightBackground ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.15)";
  const gradientTo = isLightBackground ? "rgba(239, 68, 68, 0.15)" : "rgba(248, 113, 113, 0.1)";
  const gradientHoverFrom = isLightBackground ? "rgba(239, 68, 68, 0.25)" : "rgba(248, 113, 113, 0.2)";
  const gradientHoverVia = isLightBackground ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.25)";
  const gradientHoverTo = isLightBackground ? "rgba(239, 68, 68, 0.25)" : "rgba(248, 113, 113, 0.2)";
  
  // Adjust sponsor text color for better contrast
  const sponsorTextColor = isLightBackground 
    ? "rgba(107, 114, 128, 0.8)" // gray-500/80 for light backgrounds
    : textSecondaryColor; // Use provided textSecondaryColor for dark backgrounds

  return (
    <footer 
      className="w-full flex justify-center px-3 sm:px-4 py-4 sm:py-5 md:py-6"
      style={{
        paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
      }}
    >
      <div className="w-full text-center max-w-md mx-auto">
        <p 
          className="text-[11px] sm:text-xs md:text-sm font-medium tracking-wide leading-tight"
          style={{ color: sponsorTextColor }}
        >
          {sponsorText}
        </p>
        <button
          type="button"
          onClick={handleSarfrazWhatsApp}
          className="inline-block mt-1.5 sm:mt-1 rounded-full border-2 px-6 py-1.5 text-sm font-bold font-kurdish tracking-[0.3em] transition-all duration-300 hover:scale-105 cursor-pointer"
          style={{
            borderColor: buttonBorderColor,
            color: buttonTextColor,
            background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`,
          }}
          onMouseEnter={(e) => {
            if (typeof window !== 'undefined' && window.innerWidth >= 640) {
              e.currentTarget.style.borderColor = buttonBorderHoverColor;
              e.currentTarget.style.background = `linear-gradient(to bottom right, ${gradientHoverFrom}, ${gradientHoverVia}, ${gradientHoverTo})`;
            }
          }}
          onMouseLeave={(e) => {
            if (typeof window !== 'undefined' && window.innerWidth >= 640) {
              e.currentTarget.style.borderColor = buttonBorderColor;
              e.currentTarget.style.background = `linear-gradient(to bottom right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`;
            }
          }}
        >
          {nameText}
        </button>
      </div>
    </footer>
  );
});
