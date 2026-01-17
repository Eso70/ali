"use client";

import { memo, useEffect, useState, useCallback } from "react";

type OrbPalette = {
  orb1: string[];
  orb2: string[];
  orb3: string[];
};

const DEFAULT_BASE = {
  from: "#0b1224",
  via: "#1c2d52",
  to: "#b7791f",
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeHex = (value: string | undefined): string => {
  if (!value) return "#0b1224";
  const hex = value.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(hex)) {
    return hex.toLowerCase();
  }
  if (/^#([0-9a-fA-F]{3})$/.test(hex)) {
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return "#0b1224";
};

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = normalizeHex(hex).slice(1);
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b]
    .map((channel) => {
      const clamped = clamp(Math.round(channel), 0, 255);
      const hex = clamped.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join("")}`;
};

const adjustColor = (hex: string, amount: number): string => {
  const [r, g, b] = hexToRgb(hex);
  const factor = 1 + amount;
  return rgbToHex(r * factor, g * factor, b * factor);
};

const blendColors = (a: string, bColor: string, amount: number): string => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(bColor);
  const r = r1 + (r2 - r1) * amount;
  const g = g1 + (g2 - g1) * amount;
  const b = b1 + (b2 - b1) * amount;
  return rgbToHex(r, g, b);
};

const buildOrbPalette = ({ from, via, to }: { from: string; via: string; to: string }): OrbPalette => {
  const base = normalizeHex(from);
  const middle = normalizeHex(via);
  const accent = normalizeHex(to);

  return {
    orb1: [
      adjustColor(base, -0.18),
      base,
      blendColors(base, middle, 0.35),
      accent,
      adjustColor(accent, 0.12),
    ],
    orb2: [
      adjustColor(middle, -0.12),
      blendColors(base, middle, 0.25),
      blendColors(middle, accent, 0.45),
      adjustColor(accent, -0.05),
      adjustColor(middle, 0.18),
    ],
    orb3: [
      adjustColor(accent, -0.22),
      blendColors(middle, accent, 0.25),
      accent,
      adjustColor(accent, 0.2),
      blendColors(base, accent, 0.4),
    ],
  };
};

const defaultPalette = buildOrbPalette(DEFAULT_BASE);

// Static background orbs for better performance
export const Background = memo(function Background() {
  const [palette, setPalette] = useState<OrbPalette>(defaultPalette);

  const applyPaletteFromCss = useCallback((detail?: { from?: string; via?: string; to?: string }) => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const style = getComputedStyle(document.documentElement);
      const from = normalizeHex(detail?.from || style.getPropertyValue("--theme-bg-from"));
      const via = normalizeHex(detail?.via || style.getPropertyValue("--theme-bg-via"));
      const to = normalizeHex(detail?.to || style.getPropertyValue("--theme-bg-to"));
      setPalette(buildOrbPalette({ from, via, to }));
    } catch {
      setPalette(defaultPalette);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      applyPaletteFromCss();
    });

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ from?: string; via?: string; to?: string }>;
      window.requestAnimationFrame(() => {
        applyPaletteFromCss(customEvent.detail);
      });
    };

    window.addEventListener('theme-background-change', handleThemeChange);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('theme-background-change', handleThemeChange);
    };
  }, [applyPaletteFromCss]);

  // Static orbs for better performance
  // Use default palette colors to ensure consistent server/client rendering
  const orb1Color = palette.orb1[0];
  const orb2Color = palette.orb2[0];
  const orb3Color = palette.orb3[0];

  return (
    <div 
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        contain: 'layout style paint',
        willChange: 'auto',
      }}
      suppressHydrationWarning
    >
      {/* Static orbs - render consistently on server and client */}
      <div 
        className="absolute -top-36 left-1/2 h-[520px] w-[520px] rounded-full blur-[150px]"
        style={{ 
          backgroundColor: orb1Color,
          opacity: `calc(var(--theme-blur-1-opacity, 50) / 100)`,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        suppressHydrationWarning
      />
      <div 
        className="absolute top-16 left-[12%] h-[320px] w-[320px] rounded-full blur-[150px]"
        style={{ 
          backgroundColor: orb2Color,
          opacity: `calc(var(--theme-blur-2-opacity, 40) / 100)`,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        suppressHydrationWarning
      />
      <div 
        className="absolute bottom-[-140px] right-[-80px] h-[420px] w-[420px] rounded-full blur-[170px]"
        style={{ 
          backgroundColor: orb3Color,
          opacity: `calc(var(--theme-blur-3-opacity, 35) / 100)`,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        suppressHydrationWarning
      />
    </div>
  );
});

