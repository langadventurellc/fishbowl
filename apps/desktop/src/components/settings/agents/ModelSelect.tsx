import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { useLlmModels } from "../../../hooks/useLlmModels";

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ModelSelect: React.FC<ModelSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Select a model",
}) => {
  const { models, loading, error } = useLlmModels();

  // Loading state
  if (loading) {
    return (
      <div
        className="flex items-center gap-2 p-2 border rounded-md bg-muted/50"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading models...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive flex-1">
          Failed to load models: {error.message}
        </span>
      </div>
    );
  }

  // Empty state
  if (!models || models.length === 0) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
        <span className="text-sm text-muted-foreground">
          No LLM configurations available
        </span>
      </div>
    );
  }

  // Group models by provider for better organization
  const modelsByProvider = models.reduce(
    (acc, model) => {
      if (!acc[model.providerName]) {
        acc[model.providerName] = [];
      }
      acc[model.providerName]!.push(model);
      return acc;
    },
    {} as Record<string, typeof models>,
  );

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label="Select model">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(modelsByProvider).map(
          ([providerName, providerModels]) =>
            providerModels && providerModels.length > 0 ? (
              <React.Fragment key={providerName}>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  {providerName}
                </div>
                {providerModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.providerName}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </React.Fragment>
            ) : null,
        )}
      </SelectContent>
    </Select>
  );
};
