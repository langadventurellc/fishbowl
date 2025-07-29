/**
 * FormHeader component provides mode-specific header display for personality forms.
 *
 * Features:
 * - Displays appropriate title based on create/edit mode
 * - Provides contextual description text
 * - Consistent styling with settings modal theme
 *
 * @module components/settings/FormHeader
 */

import React from "react";
import type { FormHeaderProps } from "@fishbowl-ai/shared";

export const FormHeader: React.FC<FormHeaderProps> = ({ isEditMode }) => {
  return (
    <div className="pb-6 border-b">
      <h2 className="text-xl font-semibold">
        {isEditMode ? "Edit Personality" : "Create New Personality"}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        {isEditMode
          ? "Modify the personality traits and characteristics"
          : "Define personality traits and behavioral characteristics for your agent"}
      </p>
    </div>
  );
};
