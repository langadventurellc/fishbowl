/**
 * EmptyLlmState component displays when no LLM providers are configured.
 *
 * Features:
 * - Key icon indicating API configuration
 * - Clear messaging about the empty state
 * - Provider dropdown (OpenAI/Anthropic)
 * - Dynamic setup button based on selected provider
 * - Consistent with design system patterns
 * - Accessibility attributes for screen readers
 *
 * @module components/settings/llm-setup/EmptyLlmState
 */

import type { Provider } from "@fishbowl-ai/shared";
import { Key } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import { ProviderSelector } from "./ProviderSelector";

export interface EmptyLlmStateProps {
  onSetupProvider: (provider: Provider) => void;
  className?: string;
}

export const EmptyLlmState: React.FC<EmptyLlmStateProps> = ({
  onSetupProvider,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        className,
      )}
    >
      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
        <Key className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">
        No LLM providers configured
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
        Connect your preferred LLM provider to start using AI features
      </p>
      <ProviderSelector onSetupProvider={onSetupProvider} />
    </div>
  );
};
