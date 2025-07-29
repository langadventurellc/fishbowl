/**
 * PersonalityNameInput component with comprehensive validation and accessibility.
 *
 * Features:
 * - Real-time validation with 300ms debounce
 * - Visual feedback indicators (Check/X icons)
 * - Uniqueness validation against existing personalities
 * - Error messages with screen reader announcements
 * - Character counter (optional)
 * - Full accessibility support
 *
 * @module components/settings/PersonalityNameInput
 */

import React, { useCallback, useEffect, useState } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { useDebounce } from "../../hooks/useDebounce";
import { announceToScreenReader } from "../../utils/announceToScreenReader";
import type {
  PersonalityNameInputProps,
  ValidationResult,
} from "@fishbowl-ai/shared";

export const PersonalityNameInput: React.FC<PersonalityNameInputProps> = ({
  value,
  onChange,
  existingPersonalities = [],
  showCharacterCounter = false,
  disabled = false,
  className,
  "aria-describedby": ariaDescribedBy,
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: [],
    isValidating: false,
  });

  const validateName = useCallback(
    (name: string): ValidationResult => {
      const errors: string[] = [];
      const trimmedName = name.trim();

      // Required validation
      if (!trimmedName) {
        errors.push("Personality name is required");
      }

      // Length validation
      if (trimmedName && trimmedName.length < 2) {
        errors.push("Name must be at least 2 characters");
      }
      if (name.length > 50) {
        errors.push("Name must be 50 characters or less");
      }

      // Character validation
      if (trimmedName && !/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
        errors.push(
          "Name can only contain letters, numbers, spaces, hyphens, and underscores",
        );
      }

      // Whitespace validation
      if (name && !trimmedName) {
        errors.push("Name cannot be only whitespace");
      }

      // Uniqueness validation
      if (
        trimmedName &&
        existingPersonalities.some(
          (p) => p.name.toLowerCase() === trimmedName.toLowerCase(),
        )
      ) {
        errors.push("A personality with this name already exists");
      }

      return {
        isValid: errors.length === 0 && trimmedName.length >= 2,
        errors,
        isValidating: false,
      };
    },
    [existingPersonalities],
  );

  // Debounced validation
  const debouncedValidate = useDebounce((...args: unknown[]) => {
    const name = args[0] as string;
    const result = validateName(name);
    setValidation(result);

    // Announce validation result to screen readers
    if (result.errors.length > 0 && result.errors[0]) {
      announceToScreenReader(result.errors[0], "assertive");
    } else if (result.isValid) {
      announceToScreenReader("Valid personality name", "polite");
    }
  }, 300);

  // Trigger validation on value change
  useEffect(() => {
    if (value) {
      setValidation((prev) => ({ ...prev, isValidating: true }));
      debouncedValidate(value);
    } else {
      setValidation({ isValid: false, errors: [], isValidating: false });
    }
  }, [value, debouncedValidate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const getValidationIcon = () => {
    if (!value || validation.isValidating) return null;

    if (validation.isValid) {
      return <Check className="h-4 w-4 text-green-600" aria-hidden="true" />;
    } else if (validation.errors.length > 0) {
      return <X className="h-4 w-4 text-red-600" aria-hidden="true" />;
    }

    return null;
  };

  const primaryError =
    validation.errors.length > 0 ? validation.errors[0] : undefined;
  const characterCount = value.length;
  const isInvalid = validation.errors.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="personality-name">
        Personality Name
        <span className="text-red-500 ml-1" aria-hidden="true">
          *
        </span>
      </Label>

      <div className="relative">
        <Input
          id="personality-name"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter a unique name for this personality"
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={cn(
            primaryError && "personality-name-error",
            showCharacterCounter && "personality-name-counter",
            ariaDescribedBy,
          )}
          className={cn(
            "pr-10",
            isInvalid &&
              "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
          )}
        />

        {/* Validation Icon */}
        {getValidationIcon() && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {getValidationIcon()}
          </div>
        )}
      </div>

      {/* Error Message */}
      {primaryError && (
        <div
          id="personality-name-error"
          className="flex items-center gap-2 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{primaryError}</span>
        </div>
      )}

      {/* Character Counter */}
      {showCharacterCounter && (
        <div
          id="personality-name-counter"
          className="text-xs text-muted-foreground text-right"
          aria-live="polite"
        >
          {characterCount}/50 characters
        </div>
      )}
    </div>
  );
};
