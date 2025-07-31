import type { ModelSelectProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const AVAILABLE_MODELS = [
  {
    value: "Claude 3.5 Sonnet",
    label: "Claude 3.5 Sonnet",
    provider: "Anthropic",
  },
  { value: "GPT-4", label: "GPT-4", provider: "OpenAI" },
  { value: "Claude 3 Haiku", label: "Claude 3 Haiku", provider: "Anthropic" },
  { value: "GPT-3.5 Turbo", label: "GPT-3.5 Turbo", provider: "OpenAI" },
] as const;

export const ModelSelect: React.FC<ModelSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_MODELS.map((model) => (
          <SelectItem key={model.value} value={model.value}>
            <div className="flex flex-col">
              <span>{model.label}</span>
              <span className="text-xs text-muted-foreground">
                {model.provider}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
