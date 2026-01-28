// Platform icons
import {
  SiWhatsapp,
  SiTelegram,
  SiViber,
  SiDiscord,
  SiTiktok,
  SiInstagram,
  SiFacebook,
  SiX,
  SiYoutube,
  SiLinkedin,
  SiSnapchat,
} from "react-icons/si";
import { FaPhoneAlt, FaEnvelope, FaGlobe } from "react-icons/fa";
import { DEFAULT_FOOTER_NAME, DEFAULT_FOOTER_PHONE as GLOBAL_DEFAULT_FOOTER_PHONE } from "@/lib/constants/footer";
import { BACKGROUND_GRADIENTS } from "@/lib/config/background-gradients";

// Platform definitions with react-icons and brand colors
export const SOCIAL_PLATFORMS = [
  { id: "whatsapp", name: "WhatsApp", icon: SiWhatsapp, color: "from-green-500/80 via-emerald-500/70 to-teal-500/80", brandColor: "green" },
  { id: "viber", name: "Viber", icon: SiViber, color: "from-purple-500/80 via-violet-500/70 to-fuchsia-500/80", brandColor: "purple" },
  { id: "telegram", name: "Telegram", icon: SiTelegram, color: "from-blue-500/80 via-cyan-500/70 to-sky-500/80", brandColor: "blue" },
  { id: "phone", name: "Phone Number", icon: FaPhoneAlt, color: "from-blue-500/80 via-indigo-500/70 to-blue-600/80", brandColor: "blue" },
  { id: "instagram", name: "Instagram", icon: SiInstagram, color: "from-pink-500/80 via-rose-500/70 to-orange-500/80", brandColor: "pink" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, color: "from-blue-600/80 via-blue-700/70 to-blue-800/80", brandColor: "blue" },
  { id: "twitter", name: "Twitter / X", icon: SiX, color: "from-black/80 via-gray-900/70 to-gray-800/80", brandColor: "black" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "from-black/80 via-gray-900/70 to-pink-500/80", brandColor: "black" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, color: "from-red-600/80 via-red-700/70 to-red-800/80", brandColor: "red" },
  { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, color: "from-blue-700/80 via-blue-800/70 to-blue-900/80", brandColor: "blue" },
  { id: "snapchat", name: "Snapchat", icon: SiSnapchat, color: "from-yellow-400/80 via-yellow-500/70 to-yellow-600/80", brandColor: "yellow" },
  { id: "discord", name: "Discord", icon: SiDiscord, color: "from-indigo-500/80 via-indigo-600/70 to-indigo-700/80", brandColor: "indigo" },
  { id: "email", name: "Email", icon: FaEnvelope, color: "from-gray-400/60 via-gray-500/50 to-gray-600/40", brandColor: "gray" },
  { id: "website", name: "Website", icon: FaGlobe, color: "from-emerald-400/60 via-teal-400/50 to-cyan-400/40", brandColor: "emerald" },
];

// Countries list
export const COUNTRIES = [
  { code: "964", name: "Iraq" },
  { code: "98", name: "Iran" },
  { code: "90", name: "Turkey" },
  { code: "966", name: "Saudi Arabia" },
  { code: "971", name: "United Arab Emirates" },
  { code: "1", name: "United States / Canada" },
  { code: "44", name: "United Kingdom" },
];

// Sort countries by code length descending for proper prefix matching
export const COUNTRIES_SORTED = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);

// Gradient hex color mapping for preview buttons (uses centralized config)
export const GRADIENT_HEX_MAP: Record<string, { from: string; via: string; to: string }> = 
  Object.fromEntries(
    Object.entries(BACKGROUND_GRADIENTS).map(([key, value]) => [
      key,
      { from: value.from, via: value.via, to: value.to },
    ])
  );

// Background colors - Mix of gradients and solid colors
export const BACKGROUND_COLORS = [
  { id: "default", name: "Default", gradient: "from-[#713f12] via-[#eab308] to-[#854d0e]", value: "#eab308", isSolid: false },
  { id: "blue", name: "Blue", gradient: "from-blue-900 via-blue-800 to-blue-900", value: "#1e40af", isSolid: false },
  { id: "purple", name: "Purple", gradient: "from-purple-900 via-purple-800 to-purple-900", value: "#7c3aed", isSolid: false },
  { id: "green", name: "Green", gradient: "from-green-900 via-green-800 to-green-900", value: "#166534", isSolid: false },
  { id: "orange", name: "Orange", gradient: "from-orange-900 via-orange-800 to-orange-900", value: "#c2410c", isSolid: false },
  { id: "cyan", name: "Cyan", gradient: "from-cyan-900 via-cyan-800 to-cyan-900", value: "#164e63", isSolid: false },
  { id: "indigo", name: "Indigo", gradient: "from-indigo-900 via-indigo-800 to-indigo-900", value: "#312e81", isSolid: false },
  { id: "teal", name: "Teal", gradient: "from-teal-900 via-teal-800 to-teal-900", value: "#134e4a", isSolid: false },
  { id: "yellow", name: "Yellow", gradient: "from-yellow-900 via-yellow-800 to-yellow-900", value: "#854d0e", isSolid: false },
  { id: "rose", name: "Rose", gradient: "from-rose-900 via-rose-800 to-rose-900", value: "#9f1239", isSolid: false },
  { id: "emerald", name: "Emerald", gradient: "from-emerald-900 via-emerald-800 to-emerald-900", value: "#064e3b", isSolid: false },
  { id: "violet", name: "Violet", gradient: "from-violet-900 via-violet-800 to-violet-900", value: "#4c1d95", isSolid: false },
  { id: "fuchsia", name: "Fuchsia", gradient: "from-fuchsia-900 via-fuchsia-800 to-fuchsia-900", value: "#701a75", isSolid: false },
  { id: "coral-sunset", name: "Coral Sunset", gradient: "from-[#2b1055] via-[#ff6f61] to-[#ffd166]", value: "#ff6f61", isSolid: false },
  { id: "aurora", name: "Aurora", gradient: "from-[#0b1224] via-[#0ea5e9] to-[#9333ea]", value: "#0ea5e9", isSolid: false },
  { id: "mint-glow", name: "Mint Glow", gradient: "from-[#0f172a] via-[#14b8a6] to-[#a3e635]", value: "#14b8a6", isSolid: false },
  { id: "royal-bloom", name: "Royal Bloom", gradient: "from-[#1e1b4b] via-[#9333ea] to-[#f472b6]", value: "#9333ea", isSolid: false },
  { id: "blush-gold", name: "Blush Gold", gradient: "from-[#2f1553] via-[#f472b6] to-[#facc15]", value: "#f472b6", isSolid: false },
  { id: "ice-drift", name: "Ice Drift", gradient: "from-[#0f172a] via-[#38bdf8] to-[#7c3aed]", value: "#38bdf8", isSolid: false },
  { id: "pure-white", name: "Pure White", gradient: "", value: "#ffffff", isSolid: true },
  { id: "pure-black", name: "Pure Black", gradient: "", value: "#000000", isSolid: true },
  { id: "black-gray", name: "Black to Gray", gradient: "from-black via-gray-900 to-black", value: "#0a0a0a", isSolid: false },
  { id: "black-blue", name: "Black Blue", gradient: "from-black via-blue-950 to-black", value: "#0a0a5f", isSolid: false },
  { id: "black-emerald", name: "Black Emerald", gradient: "from-black via-emerald-950 to-black", value: "#0a0f0a", isSolid: false },
  { id: "white", name: "White", gradient: "from-gray-100 via-white to-gray-100", value: "#f3f4f6", isSolid: false },
  { id: "light-gray", name: "Light Gray", gradient: "from-gray-200 via-gray-100 to-gray-200", value: "#e5e7eb", isSolid: false },
  { id: "silver", name: "Silver", gradient: "from-gray-300 via-gray-200 to-gray-300", value: "#d1d5db", isSolid: false },
  { id: "gray", name: "Gray", gradient: "from-gray-600 via-gray-500 to-gray-600", value: "#4b5563", isSolid: false },
  { id: "dark-gray", name: "Dark Gray", gradient: "from-gray-800 via-gray-700 to-gray-800", value: "#1f2937", isSolid: false },
  { id: "charcoal", name: "Charcoal", gradient: "from-gray-900 via-gray-800 to-gray-900", value: "#111827", isSolid: false },
  { id: "sky-blue", name: "Sky Blue", gradient: "from-sky-600 via-sky-500 to-sky-600", value: "#0284c7", isSolid: false },
  { id: "lime", name: "Lime", gradient: "from-lime-600 via-lime-500 to-lime-600", value: "#65a30d", isSolid: false },
  { id: "amber", name: "Amber", gradient: "from-amber-600 via-amber-500 to-amber-600", value: "#d97706", isSolid: false },
  { id: "slate", name: "Slate", gradient: "from-slate-700 via-slate-600 to-slate-700", value: "#475569", isSolid: false },
  { id: "zinc", name: "Zinc", gradient: "from-zinc-700 via-zinc-600 to-zinc-700", value: "#52525b", isSolid: false },
  { id: "stone", name: "Stone", gradient: "from-stone-700 via-stone-600 to-stone-700", value: "#57534e", isSolid: false },
  { id: "neutral", name: "Neutral", gradient: "from-neutral-700 via-neutral-600 to-neutral-700", value: "#525252", isSolid: false },
  { id: "ocean", name: "Ocean", gradient: "from-blue-600 via-cyan-500 to-teal-600", value: "#0891b2", isSolid: false },
  { id: "sunset", name: "Sunset", gradient: "from-orange-500 via-pink-500 to-rose-500", value: "#f97316", isSolid: false },
  { id: "forest", name: "Forest", gradient: "from-green-700 via-emerald-600 to-teal-700", value: "#15803d", isSolid: false },
  { id: "lavender", name: "Lavender", gradient: "from-purple-400 via-violet-400 to-fuchsia-400", value: "#a855f7", isSolid: false },
  { id: "midnight", name: "Midnight", gradient: "from-slate-900 via-indigo-900 to-purple-900", value: "#1e293b", isSolid: false },
  { id: "soft-system", name: "Soft System", gradient: "from-indigo-100 via-purple-100 to-indigo-100", value: "#7c3aed", isSolid: false },
];

// Default values
export const DEFAULT_SUBTITLE = "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە";
export const DEFAULT_FOOTER_TEXT = DEFAULT_FOOTER_NAME; // Default footer name (clickable, opens WhatsApp)
export const DEFAULT_FOOTER_PHONE = GLOBAL_DEFAULT_FOOTER_PHONE;
export const DEFAULT_WHATSAPP_MESSAGE = "";

// Kurdish platform names mapping
export function getPlatformNameKurdish(platform: string): string {
  const names: Record<string, string> = {
    whatsapp: "واتساپ",
    telegram: "تیلیگڕام",
    viber: "ڤایبەر",
    phone: "ژمارەی مۆبایل",
    instagram: "ئینستاگرام",
    facebook: "فەیسبووک",
    twitter: "تویتەر / ئێکس",
    linkedin: "لینکدئین",
    snapchat: "سناپچات",
    tiktok: "تیکتۆک",
    youtube: "یوتیوب",
    discord: "دیسکۆرد",
    email: "ئیمەیڵ",
    website: "وێبسایت",
    custom: "لینک",
  };

  return names[platform] || platform;
}
