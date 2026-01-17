"use client";

import { Link } from "@/lib/supabase/queries";
import { memo, useMemo, useCallback, type ReactNode } from "react";
import { LinkButton } from "@/components/ui/LinkButton";
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
import { FaPhoneAlt, FaEnvelope, FaGlobe, FaLink } from "react-icons/fa";

interface LinktreeButtonsProps {
  links: Link[];
  onLinkClick: (linkId: string, url: string, platform: string, defaultMessage?: string | null) => void;
}

// Memoized link item component for better performance
const LinkItem = memo(function LinkItem({
  link,
  colors,
  onLinkClick,
}: {
  link: Link;
  colors: { from: string; via: string; to: string };
  onLinkClick: (linkId: string, url: string, platform: string, defaultMessage?: string | null) => void;
}) {
  const handleClick = useCallback(() => {
    onLinkClick(link.id, link.url, link.platform, link.default_message);
  }, [link.id, link.url, link.platform, link.default_message, onLinkClick]);

  return (
    <LinkButton
      onClick={handleClick}
      gradientFrom={colors.from}
      gradientVia={colors.via}
      gradientTo={colors.to}
      className="mt-0 min-h-[48px] sm:min-h-[52px] md:min-h-[56px]"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
        {/* Icon */}
        <div className="flex-shrink-0">
          {getPlatformIcon(link.platform)}
        </div>
        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white text-left flex-1 min-w-0 truncate">
          {link.display_name || getPlatformName(link.platform)}
        </span>
      </div>
      {/* Arrow indicator - pointing right for LTR */}
      <div className="text-white/60 hover:text-white transition-colors flex-shrink-0">
        <svg
          width="20"
          height="20"
          className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M7.5 15L12.5 10L7.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </LinkButton>
  );
});

export const LinktreeButtons = memo(function LinktreeButtons({
  links,
  onLinkClick,
}: LinktreeButtonsProps) {
  // Memoize platform colors lookup to prevent recalculation on every render
  const linksWithColors = useMemo(() => {
    return links.map((link) => ({
      link,
      colors: getPlatformColors(link.platform),
    }));
  }, [links]);

  return (
    <main className="w-full space-y-2.5 sm:space-y-4 px-1 sm:px-0 mb-16">
      {linksWithColors.map(({ link, colors }) => (
        <LinkItem
          key={link.id}
          link={link}
          colors={colors}
          onLinkClick={onLinkClick}
        />
      ))}
    </main>
  );
});

// Platform colors mapping - using actual brand colors with opacity for glassmorphic effect
// Memoized for performance
const platformColorsCache = new Map<string, { from: string; via: string; to: string }>();

export function getPlatformColors(platform: string): {
  from: string;
  via: string;
  to: string;
} {
  // Cache lookup for performance
  if (platformColorsCache.has(platform)) {
    return platformColorsCache.get(platform)!;
  }
  
  const colors: Record<
    string,
    { from: string; via: string; to: string }
  > = {
    whatsapp: { 
      from: "rgba(37, 211, 102, 0.85)", // WhatsApp Green #25D366
      via: "rgba(37, 211, 102, 0.9)", 
      to: "rgba(37, 211, 102, 0.85)" 
    },
    telegram: { 
      from: "rgba(34, 158, 217, 0.85)", // Telegram Blue #229ED9
      via: "rgba(34, 158, 217, 0.9)", 
      to: "rgba(34, 158, 217, 0.85)" 
    },
    viber: { 
      from: "rgba(115, 96, 242, 0.85)", // Viber Purple #7360F2
      via: "rgba(115, 96, 242, 0.9)", 
      to: "rgba(115, 96, 242, 0.85)" 
    },
    phone: { 
      from: "rgba(0, 122, 255, 0.85)", // Phone Blue #007AFF (iOS Phone app blue)
      via: "rgba(0, 122, 255, 0.9)", 
      to: "rgba(0, 122, 255, 0.85)" 
    },
    instagram: { 
      from: "rgba(131, 58, 180, 0.85)", // Instagram Purple-Pink-Red-Yellow Gradient
      via: "rgba(253, 29, 29, 0.85)", 
      to: "rgba(252, 175, 69, 0.85)" 
    },
    facebook: { 
      from: "rgba(24, 119, 242, 0.85)", // Facebook Blue #1877F2
      via: "rgba(24, 119, 242, 0.9)", 
      to: "rgba(24, 119, 242, 0.85)" 
    },
    twitter: { 
      from: "rgba(0, 0, 0, 0.85)", // X/Twitter Black
      via: "rgba(0, 0, 0, 0.9)", 
      to: "rgba(0, 0, 0, 0.85)" 
    },
    linkedin: { 
      from: "rgba(10, 102, 194, 0.85)", // LinkedIn Blue #0A66C2
      via: "rgba(10, 102, 194, 0.9)", 
      to: "rgba(10, 102, 194, 0.85)" 
    },
    snapchat: { 
      from: "rgba(255, 252, 0, 0.85)", // Snapchat Yellow #FFFC00
      via: "rgba(255, 252, 0, 0.9)", 
      to: "rgba(255, 252, 0, 0.85)" 
    },
    tiktok: { 
      from: "rgba(0, 0, 0, 0.85)", // TikTok Black-Pink-Cyan Gradient
      via: "rgba(238, 29, 82, 0.85)", 
      to: "rgba(105, 201, 208, 0.85)" 
    },
    youtube: { 
      from: "rgba(255, 0, 0, 0.85)", // YouTube Red #FF0000
      via: "rgba(255, 0, 0, 0.9)", 
      to: "rgba(255, 0, 0, 0.85)" 
    },
    discord: { 
      from: "rgba(88, 101, 242, 0.85)", // Discord Blurple #5865F2
      via: "rgba(88, 101, 242, 0.9)", 
      to: "rgba(88, 101, 242, 0.85)" 
    },
    email: { 
      from: "rgba(26, 115, 232, 0.85)", // Email Blue #1A73E8
      via: "rgba(26, 115, 232, 0.9)", 
      to: "rgba(26, 115, 232, 0.85)" 
    },
    website: { 
      from: "rgba(37, 99, 235, 0.85)", // Website Blue #2563EB
      via: "rgba(37, 99, 235, 0.9)", 
      to: "rgba(37, 99, 235, 0.85)" 
    },
    custom: { 
      from: "rgba(107, 114, 128, 0.85)", // Custom Gray
      via: "rgba(107, 114, 128, 0.9)", 
      to: "rgba(107, 114, 128, 0.85)" 
    },
  };

  const result = colors[platform] || colors.custom;
  // Cache the result for future lookups
  platformColorsCache.set(platform, result);
  return result;
}

// Platform names mapping
export function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    viber: "Viber",
    phone: "Phone",
    instagram: "Instagram",
    facebook: "Facebook",
    twitter: "X (Twitter)",
    linkedin: "LinkedIn",
    snapchat: "Snapchat",
    tiktok: "TikTok",
    youtube: "YouTube",
    discord: "Discord",
    email: "Email",
    website: "Website",
    custom: "Link",
  };

  return names[platform] || platform;
}

// Platform icons mapping
export function getPlatformIcon(platform: string, className = "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white"): ReactNode {
  const icons: Record<string, ReactNode> = {
    whatsapp: <SiWhatsapp className={className} />,
    telegram: <SiTelegram className={className} />,
    viber: <SiViber className={className} />,
    phone: <FaPhoneAlt className={className} />,
    instagram: <SiInstagram className={className} />,
    facebook: <SiFacebook className={className} />,
    twitter: <SiX className={className} />,
    linkedin: <SiLinkedin className={className} />,
    snapchat: <SiSnapchat className={className} />,
    tiktok: <SiTiktok className={className} />,
    youtube: <SiYoutube className={className} />,
    discord: <SiDiscord className={className} />,
    email: <FaEnvelope className={className} />,
    website: <FaGlobe className={className} />,
    custom: <FaLink className={className} />,
  };

  return icons[platform] || icons.custom;
}
