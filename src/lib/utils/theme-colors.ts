/**
 * Utility functions for deriving theme colors
 * Used to generate accent colors, highlights, and other UI colors from the main theme
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * Lighten a color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * percent));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * percent));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * percent));

  return rgbToHex(r, g, b);
}

/**
 * Darken a color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.max(0, Math.round(rgb.r * (1 - percent)));
  const g = Math.max(0, Math.round(rgb.g * (1 - percent)));
  const b = Math.max(0, Math.round(rgb.b * (1 - percent)));

  return rgbToHex(r, g, b);
}

/**
 * Get the brightness of a color (0-255)
 */
function getBrightness(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 128;

  // Using relative luminance formula
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/**
 * Derive accent color from theme colors
 * Uses the "via" color (middle of gradient) as base, or lightens/darkens it
 */
export function deriveAccentColor(
  from: string,
  via: string,
  to: string
): string {
  // Use the via color as base, or pick the brightest one
  const brightness = getBrightness(via);
  const fromBrightness = getBrightness(from);
  const toBrightness = getBrightness(to);

  // Use the brightest color as base for accent
  let baseColor = via;
  if (fromBrightness > brightness && fromBrightness > toBrightness) {
    baseColor = from;
  } else if (toBrightness > brightness) {
    baseColor = to;
  }

  // If base is dark, lighten it; if light, darken it slightly
  const baseBrightness = getBrightness(baseColor);
  if (baseBrightness < 128) {
    // Dark color - lighten it for accent
    return lightenColor(baseColor, 0.4);
  } else {
    // Light color - darken it slightly for accent
    return darkenColor(baseColor, 0.2);
  }
}

/**
 * Derive border color from theme
 * Creates a semi-transparent border that works with the background
 */
export function deriveBorderColor(
  from: string,
  via: string,
  to: string,
  opacity: number = 0.3
): string {
  const accent = deriveAccentColor(from, via, to);
  const rgb = hexToRgb(accent);
  if (!rgb) return `rgba(255, 255, 255, ${opacity})`;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Derive text color from theme
 * Returns white for dark themes, dark for light themes
 */
export function deriveTextColor(from: string, via: string, to: string): string {
  const avgBrightness =
    (getBrightness(from) + getBrightness(via) + getBrightness(to)) / 3;

  return avgBrightness > 128 ? "#1f2937" : "#ffffff";
}

/**
 * Derive secondary text color (muted)
 */
export function deriveTextSecondaryColor(
  from: string,
  via: string,
  to: string
): string {
  const avgBrightness =
    (getBrightness(from) + getBrightness(via) + getBrightness(to)) / 3;

  return avgBrightness > 128
    ? "rgba(31, 41, 55, 0.7)"
    : "rgba(255, 255, 255, 0.8)";
}

/**
 * Derive highlight color (for status indicators, etc.)
 * A brighter version of the accent color
 */
export function deriveHighlightColor(
  from: string,
  via: string,
  to: string
): string {
  const accent = deriveAccentColor(from, via, to);
  const brightness = getBrightness(accent);

  if (brightness < 128) {
    // Dark accent - lighten significantly
    return lightenColor(accent, 0.6);
  } else {
    // Light accent - use as is or slightly brighten
    return lightenColor(accent, 0.1);
  }
}
