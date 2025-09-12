/**
 * ProviderSelector component for selecting and setting up LLM providers.
 *
 * Features:
 * - Provider dropdown (OpenAI/Anthropic)
 * - Dynamic setup button based on selected provider
 * - Reusable across different contexts (empty state, add another)
 * - Accessibility attributes for screen readers
 *
 * @module components/settings/llm-setup/ProviderSelector
 */

import type { Provider } from "@fishbowl-ai/shared";
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

export interface ProviderSelectorProps {
  onSetupProvider: (provider: Provider) => void;
  className?: string;
  buttonText?: string;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  onSetupProvider,
  className,
  buttonText,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider>("openai");

  const handleSetupClick = () => {
    onSetupProvider(selectedProvider);
  };

  const getButtonText = () => {
    if (buttonText) return buttonText;

    switch (selectedProvider) {
      case "openai":
        return "Set up OpenAI";
      case "anthropic":
        return "Set up Anthropic";
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
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
        </SelectContent>
      </Select>
      <Button onClick={handleSetupClick} aria-label={getButtonText()}>
        {getButtonText()}
      </Button>
    </div>
  );
};
