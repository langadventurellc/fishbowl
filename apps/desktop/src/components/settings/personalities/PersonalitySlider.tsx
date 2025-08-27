import React, { useCallback, useMemo } from "react";
import { Slider } from "../../ui/slider";
import { Label } from "../../ui/label";
import { cn } from "@/lib/utils";
import {
  DiscreteValue,
  snapToNearestDiscrete,
  DISCRETE_STEP,
} from "@fishbowl-ai/shared";

interface PersonalitySliderProps {
  traitId: string;
  label: string;
  value: DiscreteValue;
  onChange: (value: DiscreteValue) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * PersonalitySlider - A controlled slider component that enforces discrete values only.
 * Supports only values: 0, 20, 40, 60, 80, 100 with proper keyboard navigation and accessibility.
 */
export const PersonalitySlider: React.FC<PersonalitySliderProps> = ({
  traitId,
  label,
  value,
  onChange,
  disabled = false,
  className,
}) => {
  // Convert single DiscreteValue to array for Radix slider
  const sliderValue = useMemo(() => [value], [value]);

  // ARIA attributes for accessibility
  const ariaLabel = `${label} slider`;
  const ariaValuemin = 0;
  const ariaValuemax = 100;
  const ariaValuenow = value;

  // Handle value changes from the slider
  const handleValueChange = useCallback(
    (values: number[]) => {
      const newValue = values[0];
      if (newValue !== undefined && !disabled) {
        // Snap to nearest discrete value and only emit if changed
        const discreteValue = snapToNearestDiscrete(newValue);
        if (discreteValue !== value) {
          onChange(discreteValue);
        }
      }
    },
    [value, onChange, disabled],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      let newValue: DiscreteValue | null = null;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowDown":
          event.preventDefault();
          newValue = Math.max(0, value - DISCRETE_STEP) as DiscreteValue;
          break;
        case "ArrowRight":
        case "ArrowUp":
          event.preventDefault();
          newValue = Math.min(100, value + DISCRETE_STEP) as DiscreteValue;
          break;
        case "Home":
          event.preventDefault();
          newValue = 0;
          break;
        case "End":
          event.preventDefault();
          newValue = 100;
          break;
      }

      if (newValue !== null && newValue !== value) {
        onChange(newValue);
      }
    },
    [value, onChange, disabled],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={`slider-${traitId}`} className="text-sm font-medium">
          {label}
        </Label>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {value}
        </span>
      </div>
      <div
        onKeyDown={handleKeyDown}
        role="group"
        aria-labelledby={`label-${traitId}`}
      >
        <Slider
          id={`slider-${traitId}`}
          value={sliderValue}
          onValueChange={handleValueChange}
          min={ariaValuemin}
          max={ariaValuemax}
          step={DISCRETE_STEP}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-valuemin={ariaValuemin}
          aria-valuemax={ariaValuemax}
          aria-valuenow={ariaValuenow}
          className="cursor-pointer data-[disabled]:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
