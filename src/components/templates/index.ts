import dynamic from "next/dynamic";
import type { TemplateComponent } from "./types";
import {
  TEMPLATE_DEFAULT_ID,
  TEMPLATE_OPTIONS,
  type TemplateKey,
  isTemplateKey,
} from "@/lib/templates/config";

function createDynamicTemplate(factory: () => Promise<TemplateComponent>): TemplateComponent {
  return dynamic(
    () =>
      factory().then((Component) => ({
        default: Component,
      })),
    {
      ssr: false,
      loading: () => null,
    },
  ) as TemplateComponent;
}

export const TEMPLATE_COMPONENTS: Record<TemplateKey, TemplateComponent> = {
  "colorful-pills": createDynamicTemplate(() => import("./ColorfulPillsTemplate").then((m) => m.ColorfulPillsTemplate)),
  "mobile-spotlight": createDynamicTemplate(() => import("./ModernGlassTemplate").then((m) => m.ModernGlassTemplate)),
  "minimal-stripes": createDynamicTemplate(() => import("./MinimalStripesTemplate").then((m) => m.MinimalStripesTemplate)),
  "paper-cut": createDynamicTemplate(() => import("./PaperCutTemplate").then((m) => m.PaperCutTemplate)),
  "soft-neumorphic": createDynamicTemplate(() => import("./SoftNeumorphicTemplate").then((m) => m.SoftNeumorphicTemplate)),
  "organic-nature": createDynamicTemplate(() => import("./OrganicNatureTemplate").then((m) => m.OrganicNatureTemplate)),
  "terminal": createDynamicTemplate(() => import("./TerminalTemplate").then((m) => m.TerminalTemplate)),
  "smartbio": createDynamicTemplate(() => import("./SmartbioTemplate").then((m) => m.SmartbioTemplate)),
  "elegant-pro": createDynamicTemplate(() => import("./ElegantProTemplate").then((m) => m.ElegantProTemplate)),
  "frosted-outline": createDynamicTemplate(() => import("./FrostedOutlineTemplate").then((m) => m.FrostedOutlineTemplate)),
  "aurora-pills": createDynamicTemplate(() => import("./AuroraPillsTemplate").then((m) => m.AuroraPillsTemplate)),
  "soft-system": createDynamicTemplate(() => import("./SoftSystemTemplate").then((m) => m.SoftSystemTemplate)),
  "gentle-flow": createDynamicTemplate(() => import("./GentleFlowTemplate").then((m) => m.GentleFlowTemplate)),
  "ethereal-glass": createDynamicTemplate(() => import("./EtherealGlassTemplate").then((m) => m.EtherealGlassTemplate)),
  "hero-image": createDynamicTemplate(() => import("./HeroImageTemplate").then((m) => m.HeroImageTemplate)),
};

export function getTemplateComponent(templateId?: string): TemplateComponent {
  if (templateId && isTemplateKey(templateId)) {
    return TEMPLATE_COMPONENTS[templateId];
  }
  return TEMPLATE_COMPONENTS[TEMPLATE_DEFAULT_ID];
}

export { TEMPLATE_DEFAULT_ID, TEMPLATE_OPTIONS };
export type { TemplateKey };
export type { TemplateComponentProps, TemplateTheme } from "./types";
