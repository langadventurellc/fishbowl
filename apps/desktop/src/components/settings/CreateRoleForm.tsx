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
  type RoleFormData,
  type CustomRole,
  type CreateRoleFormProps,
} from "@fishbowl-ai/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { RoleNameInput } from "./RoleNameInput";
import { RoleDescriptionTextarea } from "./RoleDescriptionTextarea";

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
        console.error("Failed to save role:", error);
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
      ? (initialData as CustomRole & { id?: string }).id
      : undefined;

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="pb-6 border-b">
        <h2 className="text-xl font-semibold">
          {isEditMode ? "Edit Role" : "Create New Role"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditMode
            ? "Modify the role name and description"
            : "Define a new role with its area of expertise and purpose"}
        </p>
      </div>

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
                    maxLength={200}
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
              className="min-w-[120px]"
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
