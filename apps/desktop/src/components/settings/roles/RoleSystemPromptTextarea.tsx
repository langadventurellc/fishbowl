/**
 * RoleSystemPromptTextarea component with character counter and validation.
 *
 * Features:
 * - 8-10 row textarea with vertical resize capability
 * - Character counter with color-coded feedback (5000 char limit)
 * - Input prevention beyond maximum length
 * - Accessibility support with ARIA attributes
 * - Visual feedback: green (0-4000), yellow (4001-4500), red (4501-5000)
 * - Enhanced placeholder with usage guidance
 *
 * @module components/settings/RoleSystemPromptTextarea
 */

import { cn } from "@/lib/utils";
import type { RoleSystemPromptTextareaProps } from "@fishbowl-ai/ui-shared";
import React, { useCallback } from "react";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

export const RoleSystemPromptTextarea: React.FC<
  RoleSystemPromptTextareaProps
> = ({
  value,
  onChange,
  maxLength = 5000,
  disabled = false,
  className,
  "aria-describedby": ariaDescribedBy,
  isDirty = false,
}) => {
  const characterCount = value.length;
  const warningThreshold = Math.floor(maxLength * 0.8); // 4000 chars
  const errorThreshold = Math.floor(maxLength * 0.9); // 4500 chars

  const getCounterColor = useCallback(() => {
    if (characterCount <= warningThreshold) return "text-muted-foreground";
    if (characterCount <= errorThreshold) return "text-yellow-600";
    return "text-red-600";
  }, [characterCount, warningThreshold, errorThreshold]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="role-system-prompt" className="flex items-center gap-2">
          System Prompt
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
          {isDirty && (
            <span
              className="text-xs text-amber-600 dark:text-amber-400"
              aria-label="Field has unsaved changes"
            >
              (modified)
            </span>
          )}
        </Label>
      </div>

      <div className="relative">
        <Textarea
          id="role-system-prompt"
          value={value}
          onChange={handleChange}
          rows={10}
          disabled={disabled}
          aria-describedby={cn("role-system-prompt-counter", ariaDescribedBy)}
          className="resize-y pr-20 min-h-[200px] max-h-[400px]"
          placeholder="Define the AI agent's behavior, expertise, and communication style. For example: 'You are an experienced software architect who specializes in distributed systems. Provide detailed technical explanations while maintaining clarity. Always consider scalability, performance, and maintainability in your recommendations.'"
          tabIndex={0}
        />

        {/* Character Counter */}
        <div
          id="role-system-prompt-counter"
          className={cn(
            "absolute bottom-2 right-3 text-xs pointer-events-none",
            getCounterColor(),
          )}
          aria-live="polite"
        >
          {characterCount}/{maxLength}
        </div>
      </div>
    </div>
  );
};
