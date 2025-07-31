/**
 * BigFiveSliders component provides five personality trait sliders with live values.
 *
 * Features:
 * - Five sliders for Big Five personality traits (O, C, E, A, N)
 * - Real-time value updates with debouncing (100ms)
 * - Live value display next to each slider
 * - Full accessibility support with ARIA labels and keyboard navigation
 * - Consistent styling with design system
 *
 * @module components/settings/BigFiveSliders
 */

import { cn } from "@/lib/utils";
import type {
  BigFiveSlidersProps,
  BigFiveTraitsViewModel,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { announceToScreenReader } from "../../utils/announceToScreenReader";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

const BIG_FIVE_TRAITS = {
  openness: {
    label: "Openness",
    description: "Creativity, curiosity, and openness to new experiences",
  },
  conscientiousness: {
    label: "Conscientiousness",
    description: "Organization, discipline, and attention to detail",
  },
  extraversion: {
    label: "Extraversion",
    description: "Social energy, assertiveness, and outgoing nature",
  },
  agreeableness: {
    label: "Agreeableness",
    description: "Cooperation, trust, and consideration for others",
  },
  neuroticism: {
    label: "Neuroticism",
    description: "Emotional stability and stress response",
  },
} as const;

export const BigFiveSliders: React.FC<BigFiveSlidersProps> = ({
  values,
  onChange,
  disabled = false,
  className,
}) => {
  // Debounced screen reader announcements only
  const debouncedAnnouncement = useDebounce((...args: unknown[]) => {
    const [trait, value] = args as [keyof BigFiveTraitsViewModel, number];
    const traitInfo = BIG_FIVE_TRAITS[trait];
    announceToScreenReader(`${traitInfo.label} set to ${value}`, "polite");
  }, 300);

  const handleSliderChange = useCallback(
    (trait: keyof BigFiveTraitsViewModel) => {
      return (values: number[]) => {
        const newValue = values[0] ?? 50;
        // Immediate onChange for form updates
        onChange(trait, newValue);
        // Debounced screen reader announcement
        debouncedAnnouncement(trait, newValue);
      };
    },
    [onChange, debouncedAnnouncement],
  );

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-lg font-semibold">Big Five Personality Traits</h3>

      {(
        Object.keys(BIG_FIVE_TRAITS) as Array<keyof BigFiveTraitsViewModel>
      ).map((trait) => {
        const traitInfo = BIG_FIVE_TRAITS[trait];
        const currentValue = values[trait];

        return (
          <div key={trait} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor={`big-five-${trait}`}
                className="text-sm font-medium"
                title={traitInfo.description}
              >
                {traitInfo.label}
              </Label>
              <span
                className="text-sm font-mono font-semibold text-primary"
                aria-live="polite"
                aria-label={`Current ${traitInfo.label} value`}
              >
                {currentValue}
              </span>
            </div>

            <Slider
              id={`big-five-${trait}`}
              value={[Number(currentValue) || 50]}
              onValueChange={handleSliderChange(trait)}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              className="w-full"
              aria-label={`${traitInfo.label}: ${traitInfo.description}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={currentValue}
              aria-valuetext={`${currentValue} out of 100`}
            />

            {/* Optional description tooltip */}
            <p className="text-xs text-muted-foreground">
              {traitInfo.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default BigFiveSliders;
