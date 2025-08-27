import React, { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { PersonalitySlider } from "./PersonalitySlider";
import { PersonalitySectionDef, DiscreteValue } from "@fishbowl-ai/shared";

interface PersonalitySectionProps {
  section: PersonalitySectionDef;
  values: Record<string, DiscreteValue>;
  onChange: (traitId: string, value: DiscreteValue) => void;
  getShort: (traitId: string, value: DiscreteValue) => string | undefined;
  disabled?: boolean;
  className?: string;
}

/**
 * PersonalitySection - A collapsible section containing personality trait sliders.
 *
 * Renders a collapsible section with header, optional description, and trait sliders.
 * Persists expanded/collapsed state in sessionStorage with a stable key per section.
 */
export const PersonalitySection = React.memo<PersonalitySectionProps>(
  function PersonalitySection({
    section,
    values,
    onChange,
    getShort,
    disabled = false,
    className,
  }) {
    const storageKey = useMemo(
      () => `personality-section-${section.id}-expanded`,
      [section.id],
    );

    const [isExpanded, setIsExpanded] = useState(() => {
      try {
        const stored = sessionStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : false;
      } catch {
        return false;
      }
    });

    const handleToggle = useCallback(
      (expanded: boolean) => {
        setIsExpanded(expanded);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(expanded));
        } catch {
          // Silently fail if sessionStorage is not available
        }
      },
      [storageKey],
    );

    const contentId = useMemo(
      () => `section-${section.id}-content`,
      [section.id],
    );

    // Create onChange handlers for each trait to avoid inline functions
    const traitChangeHandlers = useMemo(() => {
      const handlers: Record<string, (value: DiscreteValue) => void> = {};
      section.values.forEach((trait) => {
        handlers[trait.id] = (value: DiscreteValue) =>
          onChange(trait.id, value);
      });
      return handlers;
    }, [section.values, onChange]);

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
            aria-controls={contentId}
          >
            <div className="text-left">
              <span className="text-lg font-semibold">{section.name}</span>
              {section.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </p>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-[var(--dt-animation-accordion-transition)]" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-[var(--dt-animation-accordion-transition)]" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent
          id={contentId}
          className="space-y-6 transition-all duration-[var(--dt-animation-accordion-transition)] ease-in-out"
        >
          <div className="space-y-4 pl-2">
            {section.values.map((trait) => {
              const currentValue = values[trait.id] ?? 40;
              const handleChange = traitChangeHandlers[trait.id];

              if (!handleChange) {
                console.warn(`No handler found for trait: ${trait.id}`);
                return null;
              }

              return (
                <PersonalitySlider
                  key={trait.id}
                  traitId={trait.id}
                  label={trait.name}
                  value={currentValue}
                  onChange={handleChange}
                  getShort={getShort}
                  disabled={disabled}
                />
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
);
