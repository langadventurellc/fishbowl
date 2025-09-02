/**
 * LlmProviderCard component displays basic LLM provider information.
 * Uses SettingsCard for consistent styling and interaction patterns.
 */

import type { LlmConfigMetadata, Provider } from "@fishbowl-ai/shared";
import React from "react";
import { SettingsCard } from "../../ui/SettingsCard";

interface LlmProviderCardProps {
  configuration: LlmConfigMetadata;
  onEdit: (config: LlmConfigMetadata) => void;
  onDelete: (configId: string) => void;
  className?: string;
}

const getProviderInfo = (provider: Provider) => {
  switch (provider) {
    case "openai":
      return { label: "OpenAI" };
    case "anthropic":
      return { label: "Anthropic" };
    default:
      return { label: "Unknown" };
  }
};

export const LlmProviderCard: React.FC<LlmProviderCardProps> = ({
  configuration,
  onEdit,
  onDelete,
  className,
}) => {
  const providerInfo = getProviderInfo(configuration.provider);

  return (
    <SettingsCard
      title={configuration.customName}
      content={providerInfo.label}
      onEdit={() => onEdit(configuration)}
      onDelete={() => onDelete(configuration.id)}
      className={className}
    />
  );
};
