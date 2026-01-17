"use client";

import { memo, useMemo } from "react";
import { LinktreeHeader } from "@/components/public/LinktreeHeader";
import { LinktreeButtons } from "@/components/public/LinktreeButtons";
import { Footer } from "@/components/public/Footer";
import type { TemplateComponentProps } from "./types";
import { deriveTextColor, deriveTextSecondaryColor } from "@/lib/utils/theme-colors";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";

export const ModernGlassTemplate = memo(function ModernGlassTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const backgroundStyle = useMemo(
    () => ({
      background: theme.isSolid 
        ? theme.from 
        : `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`,
    }),
    [theme.from, theme.via, theme.to, theme.isSolid],
  );

  const textColor = useMemo(() => deriveTextColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);
  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);

  return (
    <div 
      className="relative flex min-h-screen w-full flex-col items-center overflow-y-auto px-4 pt-10 pb-4"
      style={backgroundStyle}
    >
      <div className="w-full max-w-md mx-auto scale-[0.95] sm:scale-100">
        <LinktreeHeader linktree={linktree} textColor={textColor} textSecondaryColor={textSecondaryColor} />
      </div>

      <div className="mt-7 w-full max-w-md mx-auto mb-16">
        <LinktreeButtons links={links} onLinkClick={onLinkClick} />
      </div>

      <Footer 
        footerText={linktree.footer_text}
        footerPhone={linktree.footer_phone}
        footerHidden={linktree.footer_hidden ?? false}
        transparent={true}
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
      />
    </div>
  );
}, areTemplatePropsEqual);
