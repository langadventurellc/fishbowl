/**
 * EmptyLlmState component displays when no LLM providers are configured.
 *
 * Features:
 * - Key icon indicating API configuration
 * - Clear messaging about the empty state
 * - Provider dropdown (OpenAI/Anthropic/Google/Custom)
 * - Dynamic setup button based on selected provider
 * - Consistent with design system patterns
 * - Accessibility attributes for screen readers
 *
 * @module components/settings/llm-setup/EmptyLlmState
 */

import { Key } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import type { Provider } from "@fishbowl-ai/shared";

export interface EmptyLlmStateProps {
  onSetupProvider: (provider: Provider) => void;
  className?: string;
}

export const EmptyLlmState: React.FC<EmptyLlmStateProps> = ({
  onSetupProvider,
  className,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider>("openai");

  const handleSetupClick = () => {
    onSetupProvider(selectedProvider);
  };

  const getButtonText = () => {
    switch (selectedProvider) {
      case "openai":
        return "Set up OpenAI";
      case "anthropic":
        return "Set up Anthropic";
      case "google":
        return "Set up Google AI";
      case "custom":
        return "Set up Custom Provider";
    }
  };

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
      <div className="flex flex-col items-center gap-4">
        <Select
          value={selectedProvider}
          onValueChange={(value: Provider) => setSelectedProvider(value)}
        >
          <SelectTrigger className="w-[200px]" aria-label="Select LLM provider">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
            <SelectItem value="custom">Custom Provider</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleSetupClick}
          className="gap-2"
          aria-label={getButtonText()}
        >
          <Key className="h-4 w-4" />
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};
