/**
 * EmptyTemplatesState component displays when no templates are available in the Templates tab.
 *
 * Features:
 * - Template icon indicating template-related content
 * - Educational messaging about templates
 * - Primary action button to browse templates
 * - Consistent with design system patterns
 * - Accessibility attributes for screen readers
 *
 * @module components/settings/agents/EmptyTemplatesState
 */

import React from "react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { Sparkles } from "lucide-react";
import type { EmptyStateProps } from "@fishbowl-ai/shared";

export const EmptyTemplatesState: React.FC<EmptyStateProps> = ({
  onAction,
  className,
}) => {
  const handleBrowseTemplates = () => {
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
        <Sparkles className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">
        No templates available
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
        Templates help you quickly set up agents with pre-configured settings
      </p>
      <Button
        onClick={handleBrowseTemplates}
        className="gap-2"
        aria-label="Browse available templates"
      >
        <Sparkles className="h-4 w-4" />
        Browse Templates
      </Button>
    </div>
  );
};
