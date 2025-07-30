/**
 * BehaviorSlidersSection component for personality creation forms.
 *
 * Provides a collapsible interface for 14 behavior trait sliders organized
 * in logical groups. Features smooth animations, session persistence, and
 * comprehensive accessibility support.
 *
 * Features:
 * - 14 behavior sliders organized in 4 logical groups
 * - Collapsible with session persistence for expanded state
 * - Smooth 200ms animations for expand/collapse
 * - Full accessibility support with ARIA labels and screen reader announcements
 * - Consistent styling matching BigFiveSliders component
 *
 * @module components/settings/BehaviorSlidersSection
 */

import React, { useState, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { cn } from "@/lib/utils";
import { useDebounce } from "../../hooks/useDebounce";
import { announceToScreenReader } from "../../utils/announceToScreenReader";
import {
  type BehaviorSlidersSectionProps,
  BEHAVIOR_GROUPS,
} from "@fishbowl-ai/shared";

export const BehaviorSlidersSection: React.FC<BehaviorSlidersSectionProps> = ({
  values,
  onChange,
  disabled = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const stored = sessionStorage.getItem("behavior-sliders-expanded");
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  // Debounced screen reader announcements
  const debouncedAnnouncement = useDebounce((...args: unknown[]) => {
    const [behavior, value] = args as [string, number];
    announceToScreenReader(`${behavior} set to ${value}`, "polite");
  }, 300);

  const handleToggle = useCallback((expanded: boolean) => {
    setIsExpanded(expanded);
    try {
      sessionStorage.setItem(
        "behavior-sliders-expanded",
        JSON.stringify(expanded),
      );
    } catch {
      // Silently fail if sessionStorage is not available
    }
    announceToScreenReader(
      expanded
        ? "Advanced Behavior Settings expanded"
        : "Advanced Behavior Settings collapsed",
      "polite",
    );
  }, []);

  const handleSliderChange = useCallback(
    (behaviorKey: string, behaviorLabel: string) => {
      return (values: number[]) => {
        const newValue = values[0] ?? 50;
        // Immediate onChange for form updates
        onChange(behaviorKey, newValue);
        // Debounced screen reader announcement
        debouncedAnnouncement(behaviorLabel, newValue);
      };
    },
    [onChange, debouncedAnnouncement],
  );

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={handleToggle}
      className={cn("space-y-4", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center justify-between w-full p-0 h-auto text-left"
          type="button"
          aria-expanded={isExpanded}
          aria-controls="behavior-sliders-content"
        >
          <span className="text-lg font-semibold">
            Advanced Behavior Settings
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 transition-transform duration-[var(--dt-animation-accordion-transition)]" />
          ) : (
            <ChevronDown className="h-4 w-4 transition-transform duration-[var(--dt-animation-accordion-transition)]" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent
        id="behavior-sliders-content"
        className="space-y-6 transition-all duration-[var(--dt-animation-accordion-transition)] ease-in-out"
      >
        {BEHAVIOR_GROUPS.map((group) => (
          <div key={group.title} className="space-y-4">
            <h4 className="text-base font-medium text-foreground border-b border-border pb-1">
              {group.title}
            </h4>
            <div className="space-y-4 pl-2">
              {group.behaviors.map((behavior) => {
                const currentValue = values[behavior.key] ?? 50;

                return (
                  <div key={behavior.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`behavior-${behavior.key}`}
                        className="text-sm font-medium"
                        title={behavior.description}
                      >
                        {behavior.label}
                      </Label>
                      <span
                        className="text-sm font-mono font-semibold text-primary"
                        aria-live="polite"
                        aria-label={`Current ${behavior.label} value`}
                      >
                        {currentValue}
                      </span>
                    </div>

                    <Slider
                      id={`behavior-${behavior.key}`}
                      value={[Number(currentValue)]}
                      onValueChange={handleSliderChange(
                        behavior.key,
                        behavior.label,
                      )}
                      min={0}
                      max={100}
                      step={1}
                      disabled={disabled}
                      className="w-full"
                      aria-label={`${behavior.label}: ${behavior.description}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={currentValue}
                      aria-valuetext={`${currentValue} out of 100`}
                    />

                    <p className="text-xs text-muted-foreground">
                      {behavior.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default BehaviorSlidersSection;
