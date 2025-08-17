/**
 * PersonalityForm component provides comprehensive personality creation and editing interface.
 *
 * Features:
 * - Name input with validation
 * - Big Five personality trait sliders with live values
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
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { BehaviorSlidersSection } from "./BehaviorSlidersSection";
import { BigFiveSliders } from "./BigFiveSliders";
import { CustomInstructionsTextarea } from "./CustomInstructionsTextarea";
import { PersonalityNameInput } from "./PersonalityNameInput";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/button";

const logger = createLoggerSync({
  config: { name: "PersonalityForm", level: "info" },
});

export const PersonalityForm: React.FC<CreatePersonalityFormProps> = ({
  mode,
  initialData,
  onSave,
  onCancel,
  existingPersonalities = [],
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUnsavedChanges } = useUnsavedChanges();
  const isEditMode = mode === "edit";

  const form = useForm<PersonalityFormData>({
    resolver: zodResolver(personalitySchema),
    defaultValues: {
      name: initialData?.name || "",
      bigFive: {
        openness: initialData?.bigFive?.openness || 50,
        conscientiousness: initialData?.bigFive?.conscientiousness || 50,
        extraversion: initialData?.bigFive?.extraversion || 50,
        agreeableness: initialData?.bigFive?.agreeableness || 50,
        neuroticism: initialData?.bigFive?.neuroticism || 50,
      },
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
    const nameChanged = watchedValues.name?.trim() !== initialData.name?.trim();
    const bigFiveChanged = Object.keys(watchedValues.bigFive).some(
      (trait) =>
        watchedValues.bigFive[trait as keyof typeof watchedValues.bigFive] !==
        initialData.bigFive?.[trait as keyof typeof initialData.bigFive],
    );
    const behaviorsChanged = Object.keys(watchedValues.behaviors).some(
      (behavior) =>
        watchedValues.behaviors[
          behavior as keyof typeof watchedValues.behaviors
        ] !==
        initialData.behaviors?.[behavior as keyof typeof initialData.behaviors],
    );
    const instructionsChanged =
      watchedValues.customInstructions?.trim() !==
      initialData.customInstructions?.trim();

    return (
      nameChanged || bigFiveChanged || behaviorsChanged || instructionsChanged
    );
  }, [watchedValues, initialData, form.formState.isDirty]);

  // Track unsaved changes
  useEffect(() => {
    setUnsavedChanges(isActuallyDirty);
  }, [isActuallyDirty, setUnsavedChanges]);

  const handleSave = useCallback(
    async (data: PersonalityFormData) => {
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
        logger.error("Failed to save personality", error as Error);
        // Error handling could be enhanced with toast notifications
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSave, form, setUnsavedChanges],
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

          {/* Big Five Sliders */}
          <FormField
            control={form.control}
            name="bigFive"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <BigFiveSliders
                    values={field.value}
                    onChange={(trait, value) => {
                      field.onChange({
                        ...field.value,
                        [trait]: value,
                      });
                    }}
                    disabled={isSubmitting || isLoading}
                  />
                </FormControl>
                <FormMessage />
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
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
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
};
