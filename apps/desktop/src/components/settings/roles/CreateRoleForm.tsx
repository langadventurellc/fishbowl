/**
 * CreateRoleForm component provides comprehensive role creation and editing interface.
 *
 * Features:
 * - Name input with validation and character counter
 * - Description textarea with validation and character counter
 * - Form validation with helpful error messages
 * - Unsaved changes tracking
 * - Edit mode support with pre-populated data
 * - Comprehensive error handling and user feedback
 * - Unique name validation excluding current role in edit mode
 *
 * @module components/settings/CreateRoleForm
 */

import {
  roleSchema,
  useUnsavedChanges,
  type CreateRoleFormProps,
  type RoleViewModel,
  type RoleFormData,
} from "@fishbowl-ai/ui-shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { RoleDescriptionTextarea } from "./RoleDescriptionTextarea";
import { RoleNameInput } from "./RoleNameInput";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "CreateRoleForm", level: "info" },
});

export const CreateRoleForm: React.FC<CreateRoleFormProps> = ({
  mode,
  initialData,
  onSave,
  onCancel,
  existingRoles = [],
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUnsavedChanges } = useUnsavedChanges();
  const isEditMode = mode === "edit";

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
    mode: "onChange",
  });

  // Track unsaved changes
  useEffect(() => {
    setUnsavedChanges(form.formState.isDirty);
  }, [form.formState.isDirty, setUnsavedChanges]);

  const handleSave = useCallback(
    async (data: RoleFormData) => {
      setIsSubmitting(true);
      try {
        await onSave(data);
        // Reset form dirty state after successful save
        form.reset(data);
        setUnsavedChanges(false);
      } catch (error) {
        logger.error("Failed to save role", error as Error);
        // Error handling could be enhanced with toast notifications
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSave, form, setUnsavedChanges],
  );

  const handleCancel = useCallback(() => {
    if (form.formState.isDirty) {
      const confirmCancel = confirm(
        "You have unsaved changes. Are you sure you want to cancel?",
      );
      if (!confirmCancel) return;
    }
    setUnsavedChanges(false);
    onCancel();
  }, [form.formState.isDirty, setUnsavedChanges, onCancel]);

  const currentRoleId =
    isEditMode && initialData
      ? (initialData as RoleViewModel & { id?: string }).id
      : undefined;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <RoleNameInput
                    value={field.value}
                    onChange={field.onChange}
                    existingRoles={existingRoles}
                    currentRoleId={currentRoleId}
                    disabled={isSubmitting || isLoading}
                    aria-describedby={
                      fieldState.error ? `${field.name}-error` : undefined
                    }
                  />
                </FormControl>
                <FormMessage id={`${field.name}-error`} />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <RoleDescriptionTextarea
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={500}
                    disabled={isSubmitting || isLoading}
                    aria-describedby={
                      fieldState.error ? `${field.name}-error` : undefined
                    }
                  />
                </FormControl>
                <FormMessage id={`${field.name}-error`} />
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !form.formState.isValid ||
                isSubmitting ||
                isLoading ||
                !form.formState.isDirty
              }
              className="min-w-[var(--dt-button-min-width)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{isEditMode ? "Update" : "Save"} Role</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
