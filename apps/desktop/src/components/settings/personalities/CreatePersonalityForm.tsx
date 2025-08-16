/**
 * CreatePersonalityForm component provides comprehensive personality creation interface.
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
 *
 * @module components/settings/CreatePersonalityForm
 */

import {
  personalitySchema,
  useUnsavedChanges,
  type CreatePersonalityFormProps,
  type PersonalityFormData,
} from "@fishbowl-ai/ui-shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { FormActions } from "../FormActions";
import { FormHeader } from "../FormHeader";
import { BehaviorSlidersSection } from "./BehaviorSlidersSection";
import { BigFiveSliders } from "./BigFiveSliders";
import { CustomInstructionsTextarea } from "./CustomInstructionsTextarea";
import { PersonalityNameInput } from "./PersonalityNameInput";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "CreatePersonalityForm", level: "info" },
});

export const CreatePersonalityForm: React.FC<CreatePersonalityFormProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUnsavedChanges } = useUnsavedChanges();
  const isEditMode = !!initialData;

  // Mock data for uniqueness validation - will be replaced with store data
  const savedPersonalities = [
    {
      id: "analytical-researcher",
      name: "Analytical Researcher",
      bigFive: {
        openness: 85,
        conscientiousness: 90,
        extraversion: 35,
        agreeableness: 70,
        neuroticism: 25,
      },
      behaviors: {},
      customInstructions: "",
    },
    {
      id: "creative-brainstormer",
      name: "Creative Brainstormer",
      bigFive: {
        openness: 95,
        conscientiousness: 45,
        extraversion: 80,
        agreeableness: 85,
        neuroticism: 40,
      },
      behaviors: {},
      customInstructions: "",
    },
    {
      id: "diplomatic-mediator",
      name: "Diplomatic Mediator",
      bigFive: {
        openness: 70,
        conscientiousness: 80,
        extraversion: 65,
        agreeableness: 95,
        neuroticism: 20,
      },
      behaviors: {},
      customInstructions: "",
    },
    {
      id: "pragmatic-executor",
      name: "Pragmatic Executor",
      bigFive: {
        openness: 55,
        conscientiousness: 95,
        extraversion: 60,
        agreeableness: 65,
        neuroticism: 30,
      },
      behaviors: {},
      customInstructions: "",
    },
    {
      id: "enthusiastic-mentor",
      name: "Enthusiastic Mentor",
      bigFive: {
        openness: 80,
        conscientiousness: 75,
        extraversion: 90,
        agreeableness: 85,
        neuroticism: 35,
      },
      behaviors: {},
      customInstructions: "",
    },
  ];

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
  });

  const handleSave = useCallback(
    async (data: PersonalityFormData) => {
      setIsSubmitting(true);
      try {
        await onSave(data);
        // Reset form dirty state after successful save
        form.reset(data);
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
    // Cancel handler
    onCancel();
  }, [onCancel]);

  const handleReset = useCallback(() => {
    const confirmReset = confirm(
      "Are you sure you want to reset all fields to their default values?",
    );
    if (confirmReset) {
      form.reset();
      setUnsavedChanges(false);
    }
  }, [form, setUnsavedChanges]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        {/* Form Header */}
        <FormHeader isEditMode={isEditMode} />

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
                  existingPersonalities={savedPersonalities.filter((p) =>
                    initialData ? p.name !== initialData.name : true,
                  )}
                  showCharacterCounter={true}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
        <FormActions
          onSave={form.handleSubmit(handleSave)}
          onCancel={handleCancel}
          onReset={handleReset}
          isValid={form.formState.isValid}
          isSubmitting={isSubmitting}
          isDirty={form.formState.isDirty}
          isEditMode={isEditMode}
        />
      </form>
    </Form>
  );
};
