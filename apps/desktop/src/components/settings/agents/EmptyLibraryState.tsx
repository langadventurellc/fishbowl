/**
 * EmptyLibraryState component displays when no agents are configured in the Library tab.
 *
 * Features:
 * - Friendly UserPlus icon indicating the create action
 * - Clear messaging about the empty state
 * - Primary action button to create new agent
 * - Consistent with design system patterns
 * - Accessibility attributes for screen readers
 *
 * @module components/settings/agents/EmptyLibraryState
 */

import React from "react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { UserPlus } from "lucide-react";
import type { EmptyStateProps } from "@fishbowl-ai/shared";

export const EmptyLibraryState: React.FC<EmptyStateProps> = ({
  onAction,
  className,
}) => {
  const handleCreateAgent = () => {
    onAction?.();
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        className,
      )}
    >
      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
        <UserPlus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">
        No agents configured
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
        Create your first agent to get started with personalized AI assistants
      </p>
      <Button
        onClick={handleCreateAgent}
        className="gap-2"
        aria-label="Create your first agent"
      >
        <UserPlus className="h-4 w-4" />
        Create New Agent
      </Button>
    </div>
  );
};
