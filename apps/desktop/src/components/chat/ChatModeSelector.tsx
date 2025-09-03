/**
 * ChatModeSelector component for selecting between Manual and Round Robin chat modes.
 *
 * Features:
 * - Dropdown interface using shadcn/ui Select components
 * - Two-line layout with descriptive subtitles
 * - Graceful null/undefined value handling (defaults to "manual")
 * - Error display support for validation feedback
 * - Full accessibility with ARIA labels and keyboard navigation
 * - Consistent styling with existing components
 *
 * @module components/chat/ChatModeSelector
 */

import React from "react";
import { cn } from "../../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface ChatModeSelectorProps {
  /** Current chat mode value ("manual" | "round-robin" | null) */
  value: "manual" | "round-robin" | null;
  /** Callback when chat mode is changed */
  onValueChange: (mode: "manual" | "round-robin") => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
  /** Error message to display below the selector */
  error?: string;
}

/**
 * ChatModeSelector provides a dropdown interface for selecting chat modes.
 * Supports "manual" (full user control) and "round-robin" (automatic agent rotation).
 * Handles null values gracefully by defaulting to "manual".
 */
export const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
  className,
  error,
}) => {
  return (
    <div className="flex flex-col">
      <Select
        value={value || "manual"}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn("w-40", className)}
          aria-label="Chat mode selection"
        >
          <SelectValue placeholder="Select mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual">
            <div className="flex flex-col">
              <span>Manual</span>
              <span className="text-xs text-muted-foreground">
                Full control over agent participation
              </span>
            </div>
          </SelectItem>
          <SelectItem value="round-robin">
            <div className="flex flex-col">
              <span>Round Robin</span>
              <span className="text-xs text-muted-foreground">
                Agents take turns automatically
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {error && (
        <div className="text-sm text-destructive mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
