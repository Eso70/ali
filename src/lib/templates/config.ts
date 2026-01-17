export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  /** Tailwind classes for preview gradient backgrounds. */
  previewGradient: string;
  /** Soft accent color for outlines or glows. */
  accentHex: string;
}

export const TEMPLATE_DEFAULT_ID = "colorful-pills";

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "colorful-pills",
    name: "Colorful Pills",
    description: "Vibrant pill-shaped buttons with colorful gradients and smooth animations.",
    previewGradient: "from-blue-400 via-purple-500 to-pink-500",
    accentHex: "#8b5cf6",
  },
  {
    id: "mobile-spotlight",
    name: "Mobile Spotlight",
    description: "Classic stacked layout with direct buttons and no extra chrome.",
    previewGradient: "from-slate-950 via-slate-900 to-indigo-800",
    accentHex: "#818cf8",
  },
  {
    id: "minimal-stripes",
    name: "Minimal Stripes",
    description: "Ultra-clean frosted stripes with elevated cards and crisp typography.",
    previewGradient: "from-slate-800 via-slate-700 to-slate-900",
    accentHex: "#e5e7eb",
  },
  {
    id: "paper-cut",
    name: "Paper Cut",
    description: "Handcrafted paper art style with playful rotations and decorative elements.",
    previewGradient: "from-amber-50 via-orange-50 to-rose-50",
    accentHex: "#f59e0b",
  },
  {
    id: "soft-neumorphic",
    name: "Soft Neumorphic",
    description: "Soft shadows and subtle depth with elegant neumorphic design elements.",
    previewGradient: "from-gray-100 via-gray-150 to-gray-200",
    accentHex: "#9ca3af",
  },
  {
    id: "organic-nature",
    name: "Organic Nature",
    description: "Natural wellness aesthetic with organic shapes and earthy green tones.",
    previewGradient: "from-green-50 via-emerald-50 to-teal-50",
    accentHex: "#10b981",
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Developer-focused terminal/command-line aesthetic with green-on-black and monospace fonts.",
    previewGradient: "from-black via-gray-900 to-green-900",
    accentHex: "#00ff00",
  },
  {
    id: "smartbio",
    name: "Smartbio",
    description: "Modern mobile design with gradient header, overlapping profile, and clean black buttons.",
    previewGradient: "from-indigo-900 via-purple-600 to-pink-500",
    accentHex: "#7c3aed",
  },
  {
    id: "elegant-pro",
    name: "Elegant Pro",
    description: "Sophisticated glass-morphism design with elegant cards and smooth animations.",
    previewGradient: "from-indigo-600 via-purple-500 to-pink-500",
    accentHex: "#8b5cf6",
  },
  {
    id: "frosted-outline",
    name: "Frosted Outline",
    description: "Clean frosted glass design with outlined buttons and modern aesthetics.",
    previewGradient: "from-blue-500 via-cyan-400 to-teal-500",
    accentHex: "#06b6d4",
  },
  {
    id: "aurora-pills",
    name: "Aurora Pills",
    description: "Beautiful aurora-inspired gradient pills with smooth transitions and elegant styling.",
    previewGradient: "from-purple-500 via-pink-500 to-orange-500",
    accentHex: "#ec4899",
  },
  {
    id: "soft-system",
    name: "Soft System",
    description: "Elegant system design with soft shadows, gentle animations, and clean typography inspired by iOS/macOS.",
    previewGradient: "from-indigo-100 via-purple-100 to-indigo-100",
    accentHex: "#7c3aed",
  },
  {
    id: "gentle-flow",
    name: "Gentle Flow",
    description: "Simple and soft card-based design with gentle floating elements, clean layout, and smooth animations.",
    previewGradient: "from-pink-100 via-rose-100 to-orange-100",
    accentHex: "#f472b6",
  },
  {
    id: "ethereal-glass",
    name: "Ethereal Glass",
    description: "Ultra-modern design with layered glassmorphism, 3D floating effects, animated gradient orbs, and ethereal beauty.",
    previewGradient: "from-purple-400 via-pink-400 to-blue-400",
    accentHex: "#a855f7",
  },
  {
    id: "hero-image",
    name: "Hero Image",
    description: "Stunning full-width hero image at top (half viewport height) with gradient fade transition to beautiful dark buttons below.",
    previewGradient: "from-black via-gray-900 to-black",
    accentHex: "#000000",
  },
];

type TemplateOptionsTuple = typeof TEMPLATE_OPTIONS;
export type TemplateKey = TemplateOptionsTuple[number]["id"];

export function isTemplateKey(value: string): value is TemplateKey {
  return TEMPLATE_OPTIONS.some((option) => option.id === value);
}

export function normalizeTemplateConfig(
  templateKey?: string | null,
  templateConfig?: Record<string, unknown> | null
): Record<string, unknown> {
  const config = {
    ...(templateConfig ?? {}),
  } as Record<string, unknown>;

  const existingKey = typeof config.templateKey === "string" ? config.templateKey : undefined;

  const resolvedKey = (() => {
    if (templateKey && isTemplateKey(templateKey)) {
      return templateKey;
    }
    if (existingKey && isTemplateKey(existingKey)) {
      return existingKey;
    }
    return TEMPLATE_DEFAULT_ID;
  })();

  config.templateKey = resolvedKey;

  if (typeof config.type !== "string") {
    config.type = "simple";
  }

  if (typeof config.buttonStyle !== "string") {
    config.buttonStyle = "pill";
  }

  if (typeof config.buttonGradient !== "boolean") {
    config.buttonGradient = true;
  }

  return config;
}
