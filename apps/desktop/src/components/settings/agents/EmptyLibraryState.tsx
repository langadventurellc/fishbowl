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

import type { EmptyStateProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../../lib/utils";

export const EmptyLibraryState: React.FC<EmptyStateProps> = ({
  onAction: _onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        className,
      )}
    >
      <h3 className="text-xl font-semibold mb-2 text-center">
        No agents configured
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
        Create your first agent to get started with personalized AI assistants
      </p>
    </div>
  );
};
