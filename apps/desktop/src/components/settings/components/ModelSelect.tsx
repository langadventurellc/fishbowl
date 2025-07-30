import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { AVAILABLE_MODELS } from "../constants/models";
import type { ModelSelectProps } from "@fishbowl-ai/shared";

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
