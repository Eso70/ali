import type { ComponentType } from "react";
import type { Link, Linktree } from "@/lib/supabase/queries";

export interface TemplateTheme {
  from: string;
  via: string;
  to: string;
  isSolid?: boolean;
  // Derived accent colors for UI elements
  accent?: string; // Main accent color (for highlights, status indicators)
  border?: string; // Border color with opacity
  text?: string; // Primary text color
  textSecondary?: string; // Secondary/muted text color
  highlight?: string; // Bright highlight color (for status dots, etc.)
}

export interface TemplateComponentProps {
  linktree: Linktree;
  links: Link[];
  theme: TemplateTheme;
  onLinkClick: (linkId: string, url: string, platform: string, defaultMessage?: string | null) => void;
}

export type TemplateComponent = ComponentType<TemplateComponentProps>;
