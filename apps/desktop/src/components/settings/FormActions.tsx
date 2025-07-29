/**
 * FormActions component provides comprehensive form action buttons for personality forms.
 *
 * Features:
 * - Save/Update button with loading states
 * - Cancel button with unsaved changes warning
 * - Reset button for clearing form to defaults
 * - Auto-save status indicator
 * - Disabled states based on form validity
 * - Loading spinner during submission
 *
 * @module components/settings/FormActions
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import type { FormActionsProps } from "@fishbowl-ai/shared";

export const FormActions: React.FC<FormActionsProps> = ({
  onSave,
  onCancel,
  onReset,
  isValid,
  isSubmitting,
  isDirty,
  isEditMode,
}) => {
  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={!isDirty || isSubmitting}
        >
          Reset
        </Button>
        {!isEditMode && (
          <span className="text-xs text-muted-foreground">
            Auto-saved {isDirty ? "pending..." : "up to date"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={onSave}
          disabled={!isValid || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>{isEditMode ? "Update" : "Save"} Personality</>
          )}
        </Button>
      </div>
    </div>
  );
};
