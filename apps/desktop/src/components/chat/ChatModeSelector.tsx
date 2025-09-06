/**
 * ChatModeSelector component for selecting between Manual and Round Robin chat modes.
 *
 * Features:
 * - Dropdown interface using shadcn/ui Select components
 * - Two-line layout with descriptive subtitles
 * - Graceful null/undefined value handling (defaults to "manual")
 * - Error display support for validation feedback with proper accessibility
 * - Loading state integration (disables selector during updates)
 * - Full accessibility with ARIA labels, keyboard navigation, and error announcements
 * - Consistent styling with existing components
 *
 * Error Handling:
 * - Displays inline error messages below selector with role="alert"
 * - Error messages are properly announced to screen readers
 * - Errors are filtered to show only chat mode related errors
 * - Automatic error clearing when mode changes succeed
 *
 * Loading States:
 * - Selector disabled during loading operations
 * - Visual feedback for disabled state
 * - Prevents race conditions in rapid mode changes
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
 *
 * Integrates with conversation store error and loading states for comprehensive
 * error handling and user feedback during chat mode operations.
 */
export const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
  className,
  error,
}) => {
  const errorId = "chat-mode-error";
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col">
      <Select
        value={value || "manual"}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            hasError && "border-destructive focus:ring-destructive",
            className,
          )}
          aria-label="Chat mode selection"
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
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
        <div
          className="text-sm text-destructive mt-1"
          role="alert"
          id={errorId}
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};
