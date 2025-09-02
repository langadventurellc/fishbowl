import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { PersonalitySectionDef, DiscreteValue } from "@fishbowl-ai/shared";
import { PersonalitySection } from "./PersonalitySection";
import { AlertCircle } from "lucide-react";

interface DynamicBehaviorSectionsProps {
  /** Personality sections to render */
  sections: PersonalitySectionDef[];
  /** Helper function to get short descriptions for trait values */
  getShort: (traitId: string, value: DiscreteValue) => string | undefined;
  /** Current trait values keyed by trait ID */
  values: Record<string, DiscreteValue>;
  /** Called when a trait value changes */
  onChange: (traitId: string, value: DiscreteValue) => void;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Whether personality definitions are loading */
  isLoading?: boolean;
  /** Whether an error occurred loading personality definitions */
  isError?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DynamicBehaviorSections - Dynamic personality sections component (behaviors-only, IO-free)
 *
 * Renders personality sections and their traits using PersonalitySlider components.
 * Treats Big Five like any other section (no special-casing). Accepts definitions
 * and "getShort" synchronously from parent. Does no IO/IPC inside the component.
 * Preserves collapsible behavior and session persistence via PersonalitySection.
 *
 * Features:
 * - Dynamic section rendering from JSON definitions
 * - Collapsible sections with session persistence
 * - Loading state with skeleton placeholders
 * - Error state with inline error message
 * - No IO operations - data provided via props
 * - Full accessibility support
 * - Performance optimized with React.memo
 */
export const DynamicBehaviorSections = React.memo<DynamicBehaviorSectionsProps>(
  function DynamicBehaviorSections({
    sections,
    getShort,
    values,
    onChange,
    disabled = false,
    isLoading = false,
    isError = false,
    className,
  }) {
    // Memoized onChange to prevent unnecessary re-renders
    const handleTraitChange = useCallback(
      (traitId: string, value: DiscreteValue) => {
        if (!disabled) {
          onChange(traitId, value);
        }
      },
      [onChange, disabled],
    );

    // Loading state - show skeleton placeholders
    if (isLoading) {
      return (
        <div
          className={cn("space-y-6", className)}
          aria-busy="true"
          aria-label="Loading personality sections"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="space-y-3 pl-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-6 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Error state - show inline error message
    if (isError) {
      return (
        <div className={cn("space-y-4", className)}>
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">
                Failed to load personality definitions. Please try refreshing
                the page or contact support if the problem persists.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // No sections available
    if (!sections || sections.length === 0) {
      return (
        <div className={cn("space-y-4", className)}>
          <div className="rounded-lg border border-muted bg-muted/10 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No personality sections are available to configure.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn("space-y-6", className)}
        role="group"
        aria-label="Personality behavior sections"
      >
        {sections.map((section) => (
          <PersonalitySection
            key={section.id}
            section={section}
            values={values}
            onChange={handleTraitChange}
            getShort={getShort}
            disabled={disabled}
          />
        ))}
      </div>
    );
  },
);
