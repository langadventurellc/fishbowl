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
import { BehaviorSlidersSection } from "./BehaviorSlidersSection";
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

    const form = useForm<PersonalityFormData>({
      resolver: zodResolver(personalitySchema),
      defaultValues: {
        name: initialData?.name || "",
        behaviors: {
          // Communication Style (default: 50)
          formalityLevel: initialData?.behaviors?.formalityLevel || 50,
          verbosity: initialData?.behaviors?.verbosity || 35,
          enthusiasm: initialData?.behaviors?.enthusiasm || 50,
          directness: initialData?.behaviors?.directness || 50,
          // Interaction Approach (specialized defaults)
          helpfulness: initialData?.behaviors?.helpfulness || 75,
          patience: initialData?.behaviors?.patience || 70,
          curiosity: initialData?.behaviors?.curiosity || 60,
          empathy: initialData?.behaviors?.empathy || 65,
          // Reasoning Style (specialized defaults)
          analyticalThinking: initialData?.behaviors?.analyticalThinking || 70,
          creativity: initialData?.behaviors?.creativity || 60,
          cautionLevel: initialData?.behaviors?.cautionLevel || 60,
          // Response Characteristics (specialized defaults)
          detailLevel: initialData?.behaviors?.detailLevel || 50,
          questionAsking: initialData?.behaviors?.questionAsking || 55,
          exampleUsage: initialData?.behaviors?.exampleUsage || 50,
          responseLength: initialData?.behaviors?.responseLength || 50,
          randomness: initialData?.behaviors?.randomness || 50,
          focus: initialData?.behaviors?.focus || 50,
        },
        customInstructions: initialData?.customInstructions || "",
      },
      mode: "onChange",
      criteriaMode: "all",
    });

    // Enhanced change detection with edge case handling
    const watchedValues = form.watch();
    const isActuallyDirty = useMemo(() => {
      if (!initialData) return form.formState.isDirty;

      // Check for meaningful changes (not just whitespace)
      const nameChanged =
        watchedValues.name?.trim() !== initialData.name?.trim();

      const behaviorsChanged = Object.keys(watchedValues.behaviors).some(
        (behavior) => {
          const currentValue =
            watchedValues.behaviors[
              behavior as keyof typeof watchedValues.behaviors
            ];
          // Get the initial value, falling back to the same default used in form initialization
          const getInitialBehaviorValue = (behaviorKey: string) => {
            const initialBehaviors = initialData.behaviors || {};
            const behaviorDefaults: Record<string, number> = {
              formalityLevel: 50,
              verbosity: 35,
              enthusiasm: 50,
              directness: 50,
              helpfulness: 75,
              patience: 70,
              curiosity: 60,
              empathy: 65,
              analyticalThinking: 70,
              creativity: 60,
              cautionLevel: 60,
              detailLevel: 50,
              questionAsking: 55,
              exampleUsage: 50,
              responseLength: 50,
              randomness: 50,
              focus: 50,
            };
            return (
              initialBehaviors[behaviorKey as keyof typeof initialBehaviors] ??
              behaviorDefaults[behaviorKey] ??
              50
            );
          };

          const initialValue = getInitialBehaviorValue(behavior);
          return currentValue !== initialValue;
        },
      );

      const instructionsChanged =
        watchedValues.customInstructions?.trim() !==
        initialData.customInstructions?.trim();

      return nameChanged || behaviorsChanged || instructionsChanged;
    }, [watchedValues, initialData, form.formState.isDirty]);

    // Track unsaved changes
    useEffect(() => {
      setUnsavedChanges(isActuallyDirty);
    }, [isActuallyDirty, setUnsavedChanges]);

    // Expose reset function via ref
    useImperativeHandle(
      ref,
      () => ({
        resetToInitialData: () => {
          if (initialData) {
            form.reset(initialData, {
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
          onSave(data);
          // Reset form with new values after successful save
          form.reset(data, {
            keepDefaultValues: false,
            keepDirty: false,
            keepErrors: false,
          });
          setUnsavedChanges(false);
        } catch (error) {
          logger.error("Failed to save personality", error as Error);
          // Error handling could be enhanced with toast notifications
        } finally {
          setIsSubmitting(false);
        }
      },
      [onSave, form, setUnsavedChanges, logger],
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
                    {dynamicSections && dynamicGetShort ? (
                      <DynamicBehaviorSections
                        sections={dynamicSections}
                        getShort={dynamicGetShort}
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
                    ) : (
                      <BehaviorSlidersSection
                        values={field.value}
                        onChange={(behavior, value) => {
                          field.onChange({
                            ...field.value,
                            [behavior]: value,
                          });
                        }}
                        disabled={isSubmitting || isLoading}
                      />
                    )}
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
