/**
 * EmptyState component displays when no personalities exist in the personalities list.
 *
 * Features:
 * - Friendly Users icon indicating personalities/people
 * - Clear messaging about the empty state
 * - Primary action button to create new personality
 * - Consistent with design system patterns
 * - Accessibility attributes for screen readers
 *
 * @module components/settings/personalities/EmptyState
 */

import { Users, Plus } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onCreateClick,
  className,
}) => {
  const handleCreatePersonality = () => {
    onCreateClick();
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        className,
      )}
    >
      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">
        No personalities yet
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
        Create your first personality to define unique AI agent behaviors and
        traits
      </p>
      <Button
        onClick={handleCreatePersonality}
        className="gap-2"
        aria-label="Create your first personality"
      >
        <Plus className="h-4 w-4" />
        Create First Personality
      </Button>
    </div>
  );
};
