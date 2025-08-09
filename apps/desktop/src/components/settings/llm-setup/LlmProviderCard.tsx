/**
 * LlmProviderCard component displays a configured LLM provider API.
 *
 * Features:
 * - Enhanced provider support (OpenAI, Anthropic)
 * - Secure API key masking with provider-specific formats
 * - Provider-specific icons and color coding
 * - Additional configuration display (baseUrl, auth headers)
 * - Accessibility compliant with ARIA labels
 * - Performance optimized with React.memo
 * - Responsive design with relative timestamps
 *
 * @module components/settings/llm-setup/LlmProviderCard
 */

import type { LlmConfigMetadata, Provider } from "@fishbowl-ai/shared";
import {
  Brain,
  Edit2, // Anthropic
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import React, { useMemo } from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";

/**
 * Props interface for LlmProviderCard component
 */
interface LlmProviderCardProps {
  configuration: LlmConfigMetadata;
  onEdit: (config: LlmConfigMetadata) => void;
  onDelete: (configId: string) => void;
  className?: string;
}

/**
 * Get provider display information including icon, label, and styling
 */
const getProviderInfo = (provider: Provider) => {
  switch (provider) {
    case "openai":
      return {
        icon: <Sparkles className="h-5 w-5" />,
        label: "OpenAI",
        colorClass: "text-green-600 dark:text-green-400",
      };
    case "anthropic":
      return {
        icon: <Brain className="h-5 w-5" />,
        label: "Anthropic",
        colorClass: "text-orange-600 dark:text-orange-400",
      };
    default:
      return {
        icon: <Settings className="h-5 w-5" />,
        label: "Unknown",
        colorClass: "text-gray-600 dark:text-gray-400",
      };
  }
};

/**
 * Mask API key with provider-specific format
 * Never displays actual API key for security
 */
const maskApiKey = (provider: Provider): string => {
  switch (provider) {
    case "openai":
      return "sk-...****";
    case "anthropic":
      return "sk-ant-...****";
    default:
      return "****";
  }
};

/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 */
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
};

export const LlmProviderCard = React.memo<LlmProviderCardProps>(
  ({ configuration, onEdit, onDelete, className }) => {
    const providerInfo = useMemo(
      () => getProviderInfo(configuration.provider),
      [configuration.provider],
    );

    const maskedKey = useMemo(
      () => maskApiKey(configuration.provider),
      [configuration.provider],
    );

    const lastUpdated = useMemo(
      () => formatRelativeTime(configuration.updatedAt),
      [configuration.updatedAt],
    );

    return (
      <Card
        className={cn("w-full hover:shadow-md transition-shadow", className)}
        role="article"
        aria-label={`LLM configuration for ${configuration.customName} using ${providerInfo.label}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn("mt-0.5", providerInfo.colorClass)}>
                {providerInfo.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold truncate">
                  {configuration.customName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {providerInfo.label}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    <span>API Key: </span>
                    <code className="bg-muted px-1.5 py-0.5 rounded">
                      {maskedKey}
                    </code>
                  </div>
                  {configuration.useAuthHeader && (
                    <div className="text-xs text-muted-foreground">
                      Uses authorization header
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Updated {lastUpdated}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(configuration)}
                aria-label={`Edit ${configuration.customName} configuration`}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(configuration.id)}
                className="hover:bg-destructive/10"
                aria-label={`Delete ${configuration.customName} configuration`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.configuration.id === nextProps.configuration.id &&
      prevProps.configuration.updatedAt === nextProps.configuration.updatedAt &&
      prevProps.className === nextProps.className
    );
  },
);

LlmProviderCard.displayName = "LlmProviderCard";
