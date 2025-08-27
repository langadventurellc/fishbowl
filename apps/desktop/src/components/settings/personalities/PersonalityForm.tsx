/**
 * PersonalityForm component provides comprehensive personality creation and editing interface.
 *
 * Features:
 * - Name input with validation
 * - Collapsible behavior sliders section (14 additional traits)
 * - Custom instructions textarea
 * - Form validation with helpful error messages
 * - Unsaved changes tracking
 * - Edit mode support with pre-populated data
 * - Comprehensive error handling and user feedback
 * - Advanced change detection with meaningful comparison
 * - Field-level dirty state tracking
 *
 * @module components/settings/PersonalityForm
 */

import {
  personalitySchema,
  useUnsavedChanges,
  type CreatePersonalityFormProps,
  type PersonalityFormData,
} from "@fishbowl-ai/ui-shared";
import {
  PersonalitySectionDef,
  DiscreteValue,
  snapToNearestDiscrete,
} from "@fishbowl-ai/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { useServices } from "../../../contexts";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { DynamicBehaviorSections } from "./DynamicBehaviorSections";
import { CustomInstructionsTextarea } from "./CustomInstructionsTextarea";
import { PersonalityNameInput } from "./PersonalityNameInput";

export interface PersonalityFormRef {
  resetToInitialData: () => void;
}

// Internal props interface that extends CreatePersonalityFormProps with optional dynamic fields
interface PersonalityFormProps extends CreatePersonalityFormProps {
  /** Optional personality sections for dynamic rendering */
  dynamicSections?: PersonalitySectionDef[];
  /** Optional synchronous function to get short descriptions */
  dynamicGetShort?: (
    traitId: string,
    value: DiscreteValue,
  ) => string | undefined;
  /** Whether personality definitions are loading */
  defsLoading?: boolean;
  /** Whether an error occurred loading personality definitions */
  defsError?: boolean;
}

export const PersonalityForm = forwardRef<
  PersonalityFormRef,
  PersonalityFormProps
>(
  (
    {
      mode,
      initialData,
      onSave,
      onCancel,
      existingPersonalities = [],
      isLoading = false,
      dynamicSections,
      dynamicGetShort,
      defsLoading = false,
      defsError = false,
    },
    ref,
  ) => {
    const { logger } = useServices();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setUnsavedChanges } = useUnsavedChanges();
    const isEditMode = mode === "edit";

    // Helper to convert numeric values to discrete values
    const convertToDiscreteValues = useCallback(
      (values: Record<string, number>): Record<string, DiscreteValue> => {
        const result: Record<string, DiscreteValue> = {};
        Object.entries(values).forEach(([key, value]) => {
          result[key] = snapToNearestDiscrete(value);
        });
        return result;
      },
      [],
    );

    // Build trait ID set from dynamic sections
    const traitIdSet = useMemo(() => {
      const set = new Set<string>();
      (dynamicSections || []).forEach((section) => {
        section.values.forEach((trait) => set.add(trait.id));
      });
      return set;
    }, [dynamicSections]);

    // Helper to sanitize behaviors to only include definition-backed keys
    const sanitizeBehaviors = useCallback(
      (
        source: Record<string, number> | undefined,
        defaultValue: number = 40,
      ): Record<string, number> => {
        if (!traitIdSet.size) {
          return { ...(source || {}) };
        }
        const sanitized: Record<string, number> = {};
        traitIdSet.forEach((traitId) => {
          const val = source?.[traitId];
          sanitized[traitId] = typeof val === "number" ? val : defaultValue;
        });
        return sanitized;
      },
      [traitIdSet],
    );

    const form = useForm<PersonalityFormData>({
      resolver: zodResolver(personalitySchema),
      defaultValues: {
        name: initialData?.name || "",
        behaviors: { ...(initialData?.behaviors || {}) },
        customInstructions: initialData?.customInstructions || "",
      },
      mode: "onChange",
      criteriaMode: "all",
    });

    // Enhanced change detection with edge case handling
    const watchedValues = form.watch();
    const isActuallyDirty = useMemo(() => {
      if (!initialData) return form.formState.isDirty;

      const nameChanged =
        watchedValues.name?.trim() !== (initialData.name || "").trim();
      const instructionsChanged =
        watchedValues.customInstructions?.trim() !==
        (initialData.customInstructions || "").trim();

      const current = watchedValues.behaviors || {};
      const baseline = sanitizeBehaviors(initialData.behaviors || {}, 40);

      if (!traitIdSet.size) {
        return form.formState.isDirty || nameChanged || instructionsChanged;
      }

      let behaviorsChanged = false;
      traitIdSet.forEach((id) => {
        const a = current[id];
        const b = baseline[id];
        if (a !== b) behaviorsChanged = true;
      });
      for (const key of Object.keys(current)) {
        if (!traitIdSet.has(key)) {
          behaviorsChanged = true;
          break;
        }
      }

      return nameChanged || instructionsChanged || behaviorsChanged;
    }, [
      watchedValues,
      initialData,
      form.formState.isDirty,
      traitIdSet,
      sanitizeBehaviors,
    ]);

    // Track unsaved changes
    useEffect(() => {
      setUnsavedChanges(isActuallyDirty);
    }, [isActuallyDirty, setUnsavedChanges]);

    // When definitions load and form is pristine, sanitize behaviors to match definitions
    useEffect(() => {
      if (!traitIdSet.size) return;
      if (form.formState.isDirty) return;
      const current = form.getValues("behaviors") || {};
      const sanitized = sanitizeBehaviors(current, 40);
      form.setValue("behaviors", sanitized, { shouldDirty: false });
    }, [traitIdSet, form, sanitizeBehaviors]);

    // Expose reset function via ref
    useImperativeHandle(
      ref,
      () => ({
        resetToInitialData: () => {
          if (initialData) {
            const sanitized = {
              ...initialData,
              behaviors: sanitizeBehaviors(initialData.behaviors || {}, 40),
            };
            form.reset(sanitized, {
              keepDefaultValues: false,
              keepDirty: false,
              keepErrors: false,
            });
          }
          setUnsavedChanges(false);
        },
      }),
      [form, initialData, setUnsavedChanges],
    );

    const handleSave = useCallback(
      async (data: PersonalityFormData) => {
        setIsSubmitting(true);
        try {
          const filtered = sanitizeBehaviors(data.behaviors || {}, 40);
          onSave({ ...data, behaviors: filtered });
          // Reset form with new values after successful save
          form.reset(
            { ...data, behaviors: filtered },
            {
              keepDefaultValues: false,
              keepDirty: false,
              keepErrors: false,
            },
          );
          setUnsavedChanges(false);
        } catch (error) {
          logger.error("Failed to save personality", error as Error);
          // Error handling could be enhanced with toast notifications
        } finally {
          setIsSubmitting(false);
        }
      },
      [onSave, form, setUnsavedChanges, logger, sanitizeBehaviors],
    );

    const handleCancel = useCallback(() => {
      // Don't reset form data here - let the modal handle confirmation and reset
      // The modal will reset the form if user confirms they want to discard changes
      onCancel();
    }, [onCancel]);

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
                    <PersonalityNameInput
                      value={field.value}
                      onChange={field.onChange}
                      existingPersonalities={existingPersonalities}
                      currentPersonalityId={
                        isEditMode ? initialData?.id : undefined
                      }
                      showCharacterCounter={true}
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

            {/* Behavior Sliders */}
            <FormField
              control={form.control}
              name="behaviors"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DynamicBehaviorSections
                      sections={dynamicSections || []}
                      getShort={dynamicGetShort || (() => undefined)}
                      values={convertToDiscreteValues(field.value)}
                      onChange={(traitId, value) => {
                        field.onChange({
                          ...field.value,
                          [traitId]: value,
                        });
                      }}
                      disabled={isSubmitting || isLoading || defsError}
                      isLoading={defsLoading}
                      isError={defsError}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Instructions */}
            <FormField
              control={form.control}
              name="customInstructions"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <CustomInstructionsTextarea
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
                  !isActuallyDirty
                }
                className="min-w-[var(--dt-button-min-width)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditMode ? "Update" : "Create"} Personality</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  },
);

PersonalityForm.displayName = "PersonalityForm";
