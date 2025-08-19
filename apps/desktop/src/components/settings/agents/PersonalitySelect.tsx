import React from "react";
import {
  usePersonalitiesStore,
  type PersonalitySelectProps,
} from "@fishbowl-ai/ui-shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../../ui/button";

export const PersonalitySelect: React.FC<PersonalitySelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Select a personality",
}) => {
  const { personalities, isLoading, error } = usePersonalitiesStore(
    (state) => ({
      personalities: state.personalities,
      isLoading: state.isLoading,
      error: state.error,
    }),
  );

  const retryLastOperation = usePersonalitiesStore(
    (state) => state.retryLastOperation,
  );

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 p-2 border rounded-md bg-muted/50"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">
          Loading personalities...
        </span>
      </div>
    );
  }

  // Error state
  if (error && error.message) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive flex-1">
          Failed to load personalities: {error.message}
        </span>
        {error.isRetryable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={retryLastOperation}
            className="h-auto p-1"
            aria-label="Retry loading personalities"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (!personalities || personalities.length === 0) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
        <span className="text-sm text-muted-foreground">
          No personalities available
        </span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label="Select personality">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {personalities.map((personality) => (
          <SelectItem key={personality.id} value={personality.id}>
            <div className="flex flex-col">
              <span>{personality.name}</span>
              {personality.customInstructions && (
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {personality.customInstructions.substring(0, 50)}
                  {personality.customInstructions.length > 50 ? "..." : ""}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
