/**
 * CustomInstructionsTextarea component with character counter and validation.
 *
 * Features:
 * - 4-row textarea with fixed height (no resize)
 * - Character counter with color-coded feedback (500 char limit)
 * - Input prevention beyond maximum length
 * - Accessibility support with ARIA attributes
 * - Visual feedback: green (0-450), yellow (451-475), red (476-500)
 * - Enhanced placeholder with usage examples
 *
 * @module components/settings/CustomInstructionsTextarea
 */

import { cn } from "@/lib/utils";
import type { CustomInstructionsTextareaProps } from "@fishbowl-ai/ui-shared";
import React, { useCallback } from "react";
import { Textarea } from "../../ui/textarea";

export const CustomInstructionsTextarea: React.FC<
  CustomInstructionsTextareaProps
> = ({
  value,
  onChange,
  maxLength = 500,
  disabled = false,
  className,
  "aria-describedby": ariaDescribedBy,
}) => {
  const characterCount = value.length;
  const warningThreshold = Math.floor(maxLength * 0.8); // 400 chars
  const errorThreshold = Math.floor(maxLength * 0.9); // 450 chars

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
      <label
        htmlFor="custom-instructions"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Custom Instructions
      </label>

      <div className="relative">
        <Textarea
          id="custom-instructions"
          value={value}
          onChange={handleChange}
          rows={4}
          disabled={disabled}
          aria-describedby={cn("custom-instructions-counter", ariaDescribedBy)}
          className="resize-none pr-20"
          placeholder="Provide specific instructions for how this personality should behave and respond. For example: 'Always respond with enthusiasm and ask follow-up questions' or 'Provide detailed technical explanations with examples.'"
        />

        {/* Character Counter */}
        <div
          id="custom-instructions-counter"
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
