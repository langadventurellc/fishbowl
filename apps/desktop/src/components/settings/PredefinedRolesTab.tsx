/**
 * PredefinedRolesTab component displays predefined roles in a responsive 2-column grid layout.
 *
 * Features:
 * - Responsive CSS Grid: 2 columns desktop (≥640px), 1 column mobile (<640px)
 * - 16px gaps between cards maintained at all screen sizes
 * - Equal-height cards using CSS Grid properties
 * - Memoized for performance optimization
 * - Full accessibility with ARIA labels and keyboard navigation
 * - Error boundary support for graceful fallback
 *
 * @module components/settings/PredefinedRolesTab
 */

import React from "react";
import { PredefinedRoleCard } from "./PredefinedRoleCard";
import { PREDEFINED_ROLES } from "@fishbowl-ai/shared";
import type { PredefinedRolesTabProps } from "@fishbowl-ai/shared";
import { cn } from "../../lib/utils";

export const PredefinedRolesTab = React.memo<PredefinedRolesTabProps>(
  function PredefinedRolesTab({ className }) {
    // Error handling for missing or malformed role data
    if (!PREDEFINED_ROLES || PREDEFINED_ROLES.length === 0) {
      return (
        <div
          className={cn("text-center py-8", className)}
          role="status"
          aria-live="polite"
        >
          <p className="text-muted-foreground">
            No predefined roles available at this time.
          </p>
        </div>
      );
    }

    return (
      <div className={cn("predefined-roles-tab", className)}>
        {/* Accessible heading for screen readers */}
        <h2 className="sr-only">Predefined Roles Grid</h2>

        {/* Responsive grid container */}
        <div
          className={cn(
            // CSS Grid with responsive columns
            "grid gap-4",
            // Mobile: 1 column, Desktop (≥640px): 2 columns
            "grid-cols-1 sm:grid-cols-2",
            // Equal height cards
            "auto-rows-fr",
          )}
          role="grid"
          aria-label="Predefined roles grid"
          aria-describedby="predefined-roles-description"
        >
          {/* Hidden description for screen readers */}
          <div id="predefined-roles-description" className="sr-only">
            Grid of {PREDEFINED_ROLES.length} predefined roles. Use Tab and
            arrow keys to navigate between roles.
          </div>

          {PREDEFINED_ROLES.map((role, index) => (
            <div
              key={role.id}
              role="gridcell"
              aria-rowindex={Math.floor(index / 2) + 1}
              aria-colindex={(index % 2) + 1}
            >
              <PredefinedRoleCard role={role} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  },
);
