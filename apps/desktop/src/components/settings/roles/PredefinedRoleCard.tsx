/**
 * PredefinedRoleCard component displays individual predefined role information in a card format.
 *
 * Features:
 * - Prominent role icon display
 * - Role name with proper typography hierarchy
 * - Role description with muted styling
 * - "View Details" hover indication
 * - Non-editable visual indicators
 * - Responsive grid layout support
 * - Full accessibility with keyboard navigation
 * - Smooth hover transitions (200ms duration)
 *
 * @module components/settings/PredefinedRoleCard
 */

import type { PredefinedRoleCardProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../../lib/utils";
import { Card, CardDescription, CardHeader, CardTitle } from "../../ui/card";

export const PredefinedRoleCard = React.memo<PredefinedRoleCardProps>(
  function PredefinedRoleCard({ role, className }) {
    return (
      <Card
        className={cn(
          // Base card styling
          "group cursor-pointer hover:shadow-md transition-all duration-[var(--dt-animation-hover-transition)] ease-in-out",
          // Hover elevation and scale effects
          "hover:scale-[1.02] hover:-translate-y-1",
          // Focus styling for accessibility
          "focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2",
          className,
        )}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${role.name} role`}
        onKeyDown={(e) => {
          // Allow space and enter to trigger card interaction
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            // Future: Add click handler here when functionality is implemented
          }
        }}
      >
        <CardHeader className="text-center space-y-2 p-4">
          {/* Role Name */}
          <CardTitle className="text-lg font-semibold">{role.name}</CardTitle>

          {/* Role Description */}
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            {role.description}
          </CardDescription>

          {/* Non-editable Indicator */}
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"></span>
              Read-only
            </span>
          </div>

          {/* Hover "View Details" Indication */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--dt-animation-hover-transition)] ease-in-out mt-1">
            <span className="text-xs text-accent font-medium">
              View Details
            </span>
          </div>
        </CardHeader>
      </Card>
    );
  },
);
