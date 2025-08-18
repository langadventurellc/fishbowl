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
import React, { useCallback, useEffect, useState, useMemo } from "react";
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
import { RoleSystemPromptTextarea } from "./RoleSystemPromptTextarea";
import { useServices } from "../../../contexts";

export const CreateRoleForm: React.FC<CreateRoleFormProps> = ({
  mode,
  initialData,
  onSave,
  onCancel,
  existingRoles = [],
  isLoading = false,
}) => {
  const { logger } = useServices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUnsavedChanges } = useUnsavedChanges();
  const isEditMode = mode === "edit";

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      systemPrompt: initialData?.systemPrompt || "",
    },
    mode: "onChange",
    criteriaMode: "all",
  });

  // Enhanced change detection with edge case handling
  const watchedValues = form.watch();
  const isActuallyDirty = useMemo(() => {
    if (!initialData) return form.formState.isDirty;

    // Check for meaningful changes (not just whitespace)
    const nameChanged = watchedValues.name?.trim() !== initialData.name?.trim();
    const descChanged =
      watchedValues.description?.trim() !== initialData.description?.trim();
    const promptChanged =
      watchedValues.systemPrompt?.trim() !== initialData.systemPrompt?.trim();

    return nameChanged || descChanged || promptChanged;
  }, [watchedValues, initialData, form.formState.isDirty]);

  // Track unsaved changes
  useEffect(() => {
    setUnsavedChanges(isActuallyDirty);
  }, [isActuallyDirty, setUnsavedChanges]);

  const handleSave = useCallback(
    async (data: RoleFormData) => {
      setIsSubmitting(true);
      try {
        await onSave(data);
        // Reset form with new values after successful save
        form.reset(data, {
          keepDefaultValues: false,
          keepDirty: false,
          keepErrors: false,
        });
        setUnsavedChanges(false);
      } catch (error) {
        logger.error("Failed to save role", error as Error);
        // Error handling could be enhanced with toast notifications
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSave, form, setUnsavedChanges, logger],
  );

  const handleCancel = useCallback(() => {
    // Reset to original values on cancel
    if (initialData) {
      form.reset(initialData, {
        keepDefaultValues: false,
        keepDirty: false,
        keepErrors: false,
      });
    }
    setUnsavedChanges(false);
    onCancel();
  }, [form, initialData, setUnsavedChanges, onCancel]);

  const currentRoleId =
    isEditMode && initialData
      ? (initialData as RoleViewModel & { id?: string }).id
      : undefined;

  // Get field-level dirty states for visual indicators
  const isNameDirty = useMemo(() => {
    if (!initialData) return form.formState.dirtyFields.name;
    return watchedValues.name?.trim() !== initialData.name?.trim();
  }, [watchedValues.name, initialData, form.formState.dirtyFields.name]);

  const isDescriptionDirty = useMemo(() => {
    if (!initialData) return form.formState.dirtyFields.description;
    return (
      watchedValues.description?.trim() !== initialData.description?.trim()
    );
  }, [
    watchedValues.description,
    initialData,
    form.formState.dirtyFields.description,
  ]);

  const isSystemPromptDirty = useMemo(() => {
    if (!initialData) return form.formState.dirtyFields.systemPrompt;
    return (
      watchedValues.systemPrompt?.trim() !== initialData.systemPrompt?.trim()
    );
  }, [
    watchedValues.systemPrompt,
    initialData,
    form.formState.dirtyFields.systemPrompt,
  ]);

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
                    isDirty={isNameDirty}
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
                    isDirty={isDescriptionDirty}
                    aria-describedby={
                      fieldState.error ? `${field.name}-error` : undefined
                    }
                  />
                </FormControl>
                <FormMessage id={`${field.name}-error`} />
              </FormItem>
            )}
          />

          {/* System Prompt Field */}
          <FormField
            control={form.control}
            name="systemPrompt"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <RoleSystemPromptTextarea
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={5000}
                    disabled={isSubmitting || isLoading}
                    isDirty={isSystemPromptDirty}
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
                !isActuallyDirty
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
