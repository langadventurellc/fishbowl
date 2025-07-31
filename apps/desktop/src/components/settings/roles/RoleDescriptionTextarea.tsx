/**
 * RoleDescriptionTextarea component with character counter and validation.
 *
 * Features:
 * - 4-row textarea with fixed height (no resize)
 * - Character counter with color-coded feedback (200 char limit)
 * - Input prevention beyond maximum length
 * - Accessibility support with ARIA attributes
 * - Visual feedback: green (0-160), yellow (161-180), red (181-200)
 * - Enhanced placeholder with usage examples
 *
 * @module components/settings/RoleDescriptionTextarea
 */

import { cn } from "@/lib/utils";
import type { RoleDescriptionTextareaProps } from "@fishbowl-ai/ui-shared";
import React, { useCallback } from "react";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

export const RoleDescriptionTextarea: React.FC<
  RoleDescriptionTextareaProps
> = ({
  value,
  onChange,
  maxLength = 200,
  disabled = false,
  className,
  "aria-describedby": ariaDescribedBy,
}) => {
  const characterCount = value.length;
  const warningThreshold = Math.floor(maxLength * 0.8); // 160 chars
  const errorThreshold = Math.floor(maxLength * 0.9); // 180 chars

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
      <Label htmlFor="role-description">
        Role Description
        <span className="text-red-500 ml-1" aria-hidden="true">
          *
        </span>
      </Label>

      <div className="relative">
        <Textarea
          id="role-description"
          value={value}
          onChange={handleChange}
          rows={4}
          disabled={disabled}
          aria-describedby={cn("role-description-counter", ariaDescribedBy)}
          className="resize-none pr-20"
          placeholder="Describe the role's purpose and expertise area. For example: 'Specializes in software development and technical problem-solving' or 'Focuses on user experience and visual design solutions.'"
        />

        {/* Character Counter */}
        <div
          id="role-description-counter"
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
