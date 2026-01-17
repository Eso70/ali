"use client";

import { memo, useMemo } from "react";
import type { TemplateComponentProps } from "./types";
import { TEMPLATE_COMPONENTS, TEMPLATE_DEFAULT_ID, type TemplateKey } from ".";
import { normalizeTemplateConfig, isTemplateKey } from "@/lib/templates/config";

type UnknownRecord = Record<string, unknown>;

function coerceTemplateConfig(config: unknown): UnknownRecord | null {
  if (!config) {
    return null;
  }

  if (typeof config === "string") {
    try {
      const parsed = JSON.parse(config) as unknown;
      return typeof parsed === "object" && parsed !== null ? (parsed as UnknownRecord) : null;
    } catch {
      return null;
    }
  }

  if (typeof config === "object") {
    return config as UnknownRecord;
  }

  return null;
}

function extractTemplateKey(config: UnknownRecord | null, fallback?: unknown): TemplateKey {
  const candidate = [
    config?.["templateKey"],
    config?.["template_key"],
    fallback,
  ].find((value): value is string => typeof value === "string");

  return candidate && isTemplateKey(candidate) ? candidate : TEMPLATE_DEFAULT_ID;
}

export const DynamicTemplate = memo(function DynamicTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const normalizedConfig = useMemo(() => {
    const configObject = coerceTemplateConfig(linktree.template_config);
    const legacyKey = (linktree as { template_key?: unknown }).template_key;
    const resolvedKey = extractTemplateKey(configObject, legacyKey);
    return normalizeTemplateConfig(resolvedKey, configObject ?? undefined);
  }, [linktree]);

  const templateKey = useMemo(() => {
    const value = normalizedConfig["templateKey"];
    return typeof value === "string" && isTemplateKey(value) ? value : TEMPLATE_DEFAULT_ID;
  }, [normalizedConfig]);

  const linktreeWithConfig = useMemo(() => ({
    ...linktree,
    template_config: normalizedConfig,
  }), [linktree, normalizedConfig]);

  const TemplateComponent = TEMPLATE_COMPONENTS[templateKey] ?? TEMPLATE_COMPONENTS[TEMPLATE_DEFAULT_ID];

  return (
    <TemplateComponent
      linktree={linktreeWithConfig}
      links={links}
      theme={theme}
      onLinkClick={onLinkClick}
    />
  );
});
