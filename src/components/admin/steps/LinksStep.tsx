"use client";

import { memo, useMemo, useCallback } from "react";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { SOCIAL_PLATFORMS, getPlatformNameKurdish } from "../modal-constants";
import { CountrySelector } from "@/components/ui/CountrySelector";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  value?: string;
  countryCode?: string;
  displayName?: string;
  enabled: boolean;
  order?: number;
}

interface LinkItemProps {
  linkId: string;
  platform: typeof SOCIAL_PLATFORMS[0];
  isPhoneBased: boolean;
  currentValue: string;
  countryCode?: string;
  displayName?: string;
  error?: string;
  onUpdate: (id: string, value: string) => void;
  onUpdateCountryCode: (id: string, countryCode: string) => void;
  onUpdateDisplayName: (id: string, displayName: string) => void;
  onRemove: (id: string) => void;
  onAdd: (platformId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const LinkItem = memo(function LinkItem({
  linkId,
  platform,
  isPhoneBased,
  currentValue,
  countryCode,
  displayName,
  error,
  onUpdate,
  onUpdateCountryCode,
  onUpdateDisplayName,
  onRemove,
  onAdd,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: LinkItemProps) {
  const Icon = platform.icon;

  // Memoize handlers to prevent re-renders
  const handleUpdate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(linkId, e.target.value);
  }, [linkId, onUpdate]);

  const handleCountryCodeChange = useCallback((code: string) => {
    onUpdateCountryCode(linkId, code);
  }, [linkId, onUpdateCountryCode]);

  const handleDisplayNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateDisplayName(linkId, e.target.value);
  }, [linkId, onUpdateDisplayName]);

  const handleKurdishDisplayName = useCallback(() => {
    const kurdishName = getPlatformNameKurdish(platform.id);
    onUpdateDisplayName(linkId, kurdishName);
  }, [linkId, platform.id, onUpdateDisplayName]);

  const handleRemove = useCallback(() => {
    onRemove(linkId);
  }, [linkId, onRemove]);

  const handleAdd = useCallback(() => {
    onAdd(platform.id);
  }, [platform.id, onAdd]);

  return (
    <div
      className="flex flex-col gap-3 rounded-lg sm:rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 flex-1">
          {/* Move Up/Down Buttons */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="بەرزکردنەوە"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="نزمکردنەوە"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <label className="block text-xs sm:text-sm font-medium text-gray-900 select-none flex-1">
            {platform.name}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-lg p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            title={`سڕینەوەی ${platform.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg p-1 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-700"
            title={`زیادکردنی لینکی تر بۆ ${platform.name}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-2">
          <p className="text-xs text-red-600 font-kurdish">{error}</p>
        </div>
      )}
      
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        <div className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br ${platform.color} flex-shrink-0`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
        </div>
        <div className="flex flex-col gap-2 flex-1 w-full">
          {/* URL/Phone Input Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            {isPhoneBased && (
              <CountrySelector
                value={countryCode || "964"}
                onChange={handleCountryCodeChange}
                className="flex-shrink-0"
              />
            )}
            <input
              type="text"
              value={currentValue}
              onChange={handleUpdate}
              placeholder={
                isPhoneBased ? "07501234567" :
                platform.id === "telegram" ? "username or https://t.me/username" :
                platform.id === "instagram" ? "Any Instagram link: profile, post, reel, story, etc." :
                platform.id === "tiktok" ? "Any TikTok link: profile, video, vm.tiktok.com, etc." :
                platform.id === "snapchat" ? "Any Snapchat link: add, t/, p/, stories, spotlight, etc." :
                platform.id === "twitter" ? "Any Twitter/X link: profile, tweet, hashtag, etc." :
                platform.id === "facebook" ? "Any Facebook link: profile, page, event, group, watch, etc." :
                platform.id === "linkedin" ? "Any LinkedIn link: profile, company, post, school, group, etc." :
                platform.id === "youtube" ? "Any YouTube link: channel, video, playlist, shorts, youtu.be, etc." :
                platform.id === "discord" ? "User ID (e.g., 123456789012345678)" :
                platform.id === "email" ? "email@example.com" :
                platform.id === "website" ? "example.com" :
                "Enter value"
              }
              className={`flex-1 w-full rounded-lg sm:rounded-xl md:rounded-2xl border ${
                error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
              } px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 text-xs sm:text-sm md:text-base text-gray-900 placeholder:text-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30`}
            />
          </div>
          
          {/* Display Name Input Row */}
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={displayName || ""}
              onChange={handleDisplayNameChange}
              placeholder="ئەگەر بەتاڵ بێت ناوی ئینگلیزی بەکاردێت"
              className={`flex-1 w-full rounded-lg sm:rounded-xl md:rounded-2xl border ${
                error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
              } px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 text-xs sm:text-sm md:text-base text-gray-900 placeholder:text-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 font-kurdish`}
            />
            <button
              type="button"
              onClick={handleKurdishDisplayName}
              className="flex-shrink-0 px-2 sm:px-3 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl md:rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors text-xs sm:text-sm md:text-base font-kurdish"
              title="کوردی"
            >
              کوردی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

interface LinksStepProps {
  selectedPlatforms: string[];
  socialLinks: SocialLink[];
  linkErrors: Record<string, string>;
  error?: string;
  touched?: boolean;
  onUpdateLink: (id: string, value: string) => void;
  onUpdateCountryCode: (id: string, countryCode: string) => void;
  onUpdateDisplayName: (id: string, displayName: string) => void;
  onRemoveLink: (id: string) => void;
  onAddPlatformInstance: (platformId: string) => void;
  onMoveLink: (linkId: string, direction: 'up' | 'down') => void;
}

export const LinksStep = memo(function LinksStep({
  selectedPlatforms,
  socialLinks,
  linkErrors,
  error,
  touched,
  onUpdateLink,
  onUpdateCountryCode,
  onUpdateDisplayName,
  onRemoveLink,
  onAddPlatformInstance,
  onMoveLink,
}: LinksStepProps) {
  // Create lookup maps for O(1) access
  const linksMap = useMemo(() => {
    return new Map(socialLinks.map(link => [link.id, link]));
  }, [socialLinks]);

  const platformsMap = useMemo(() => {
    return new Map(SOCIAL_PLATFORMS.map(platform => [platform.id, platform]));
  }, []);

  const sortedLinks = useMemo(() => {
    return selectedPlatforms
      .map(linkId => {
        const link = linksMap.get(linkId);
        if (!link) return null;
        const platform = platformsMap.get(link.platform);
        if (!platform) return null;
        return { linkId, platform, link };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => (a.link.order ?? 0) - (b.link.order ?? 0));
  }, [selectedPlatforms, linksMap, platformsMap]);

  if (sortedLinks.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-center text-xs sm:text-sm text-gray-600 py-8">
          هیچ پلاتفۆرمێک هەڵنەبژێردراوە
        </p>
        {error && touched && (
          <p className="text-xs text-red-600 text-center font-kurdish">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-xs sm:text-sm text-gray-600">لینکەکان بۆ پلاتفۆرمە هەڵبژێردراوەکان زیاد بکە</p>
      
      <div className="space-y-2 sm:space-y-3">
        {sortedLinks.map(({ linkId, platform, link }, index) => {
          if (!platform || !link) return null;
          const isPhoneBased = platform.id === "whatsapp" || platform.id === "phone" || platform.id === "viber";
          const currentValue = link.value || "";
          const linkError = linkErrors[linkId];

          return (
            <LinkItem
              key={linkId}
              linkId={linkId}
              platform={platform}
              isPhoneBased={isPhoneBased}
              currentValue={currentValue}
              countryCode={link.countryCode || "964"}
              displayName={link.displayName}
              error={linkError}
              onUpdate={onUpdateLink}
              onUpdateCountryCode={onUpdateCountryCode}
              onUpdateDisplayName={onUpdateDisplayName}
              onRemove={onRemoveLink}
              onAdd={onAddPlatformInstance}
              onMoveUp={() => onMoveLink(linkId, 'up')}
              onMoveDown={() => onMoveLink(linkId, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < sortedLinks.length - 1}
            />
          );
        })}
      </div>
      
      {error && touched && (
        <p className="text-xs text-red-600 mt-2 text-center font-kurdish">{error}</p>
      )}
    </div>
  );
});
