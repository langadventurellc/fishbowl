/**
 * PersonalitiesList component serves as the main container for displaying all personalities
 * in a responsive grid layout.
 *
 * Features:
 * - Responsive grid layout (1/2/3 columns)
 * - Empty state handling with EmptyState component
 * - Loading state support
 * - Passes callbacks to individual PersonalityCard components
 * - Proper accessibility and performance optimizations
 *
 * @module components/settings/personalities/PersonalitiesList
 */

import type { PersonalityViewModel } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../../lib/utils";
import { EmptyState } from "./EmptyState";
import { PersonalityCard } from "./PersonalityCard";

interface PersonalitiesListProps {
  /** Array of personalities to display */
  personalities: PersonalityViewModel[];
  /** Callback when a personality's edit button is clicked */
  onEdit: (personality: PersonalityViewModel) => void;
  /** Callback when a personality's delete button is clicked */
  onDelete: (personality: PersonalityViewModel) => void;
  /** Callback when create button is clicked in empty state */
  onCreateClick: () => void;
  /** Optional loading state indicator */
  isLoading?: boolean;
  /** Additional CSS class names */
  className?: string;
}

export const PersonalitiesList: React.FC<PersonalitiesListProps> = ({
  personalities,
  onEdit,
  onDelete,
  onCreateClick,
  isLoading = false,
  className,
}) => {
  // Simple loading state (can be enhanced with skeleton cards if needed)
  if (isLoading) {
    return (
      <div
        className={cn("flex items-center justify-center py-16", className)}
        aria-label="Loading personalities"
      >
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show empty state when no personalities exist
  if (personalities.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} className={className} />;
  }

  // Render grid of personality cards
  return (
    <div
      className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}
      role="grid"
      aria-label={`${personalities.length} personalities available`}
    >
      {personalities.map((personality) => (
        <div key={personality.id} role="gridcell">
          <PersonalityCard
            personality={personality}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};
