/**
 * CreatePersonalityForm component provides comprehensive personality creation interface.
 *
 * Features:
 * - Name input with validation
 * - Big Five personality trait sliders with live values
 * - Collapsible behavior sliders section (14 additional traits)
 * - Custom instructions textarea
 * - Form validation with helpful error messages
 * - Unsaved changes tracking with auto-save functionality
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
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { BehaviorSlidersSection } from "./BehaviorSlidersSection";
import { BigFiveSliders } from "./BigFiveSliders";
import { CustomInstructionsTextarea } from "./CustomInstructionsTextarea";
import { FormActions } from "./FormActions";
import { FormHeader } from "./FormHeader";
import { PersonalityNameInput } from "./PersonalityNameInput";

export const CreatePersonalityForm: React.FC<CreatePersonalityFormProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // TEMPORARILY DISABLED: lastSavedData for unsaved changes tracking
  // const [lastSavedData, setLastSavedData] =
  //   useState<PersonalityFormData | null>(null);
  const { setUnsavedChanges } = useUnsavedChanges();
  const isEditMode = !!initialData;
  // TEMPORARILY DISABLED: initialDataRef for unsaved changes tracking
  // const initialDataRef = useRef(initialData);

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

  // TEMPORARILY DISABLED: Simple object comparison for unsaved changes detection
  // const isEqual = (a: PersonalityFormData | null, b: PersonalityFormData) => {
  //   return JSON.stringify(a) === JSON.stringify(b);
  // };

  // DISABLED: Unsaved changes tracking causes form reset issues
  // Will implement this properly in a future iteration
  // useEffect(() => {
  //   setUnsavedChanges(form.formState.isDirty);
  // }, [form.formState.isDirty, setUnsavedChanges]);

  // Auto-save functionality with localStorage
  const autoSaveCallback = useCallback(
    (data: PersonalityFormData) => {
      if (data.name && data.name.length >= 2 && !isEditMode) {
        try {
          const draftKey = `personality-draft-${Date.now()}`;
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              ...data,
              timestamp: Date.now(),
              isEditMode: false,
            }),
          );
          // Clean up old drafts (keep only 3 most recent)
          cleanupOldDrafts();
        } catch (error) {
          console.warn("Failed to save draft:", error);
        }
      }
    },
    [isEditMode],
  );

  const debouncedAutoSave = useDebounce((...args: unknown[]) => {
    const data = args[0] as PersonalityFormData;
    autoSaveCallback(data);
  }, 2000);

  // Cleanup old drafts from localStorage
  const cleanupOldDrafts = () => {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("personality-draft-"),
      );
      if (keys.length > 3) {
        keys
          .sort()
          .slice(0, -3)
          .forEach((key) => localStorage.removeItem(key));
      }
    } catch (error) {
      console.warn("Failed to cleanup old drafts:", error);
    }
  };

  // Auto-save trigger
  const watchedValues = form.watch();
  useEffect(() => {
    if (form.formState.isDirty && form.formState.isValid) {
      const currentData = form.getValues();
      debouncedAutoSave(currentData);
    }
  }, [
    watchedValues,
    debouncedAutoSave,
    form.formState.isDirty,
    form.formState.isValid,
    form,
  ]);

  // Draft recovery on component mount
  useEffect(() => {
    if (!initialData) {
      try {
        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith("personality-draft-"),
        );
        if (keys.length > 0) {
          const latestKey = keys.sort().pop();
          if (latestKey) {
            const savedDraft = localStorage.getItem(latestKey);
            if (savedDraft) {
              const draftData = JSON.parse(savedDraft);
              if (draftData && !draftData.isEditMode) {
                // For now, just log that a draft exists - in production you might show a dialog
                console.log("Draft available for recovery:", draftData);
              }
            }
          }
        }
      } catch (error) {
        console.warn("Failed to recover draft:", error);
      }
    }
  }, [initialData]);

  // TEMPORARILY DISABLED: Set initial saved data for comparison
  // useEffect(() => {
  //   if (initialDataRef.current) {
  //     setLastSavedData(initialDataRef.current as PersonalityFormData);
  //   } else {
  //     // For create mode, set lastSavedData to the current form defaults
  //     setLastSavedData(form.getValues());
  //   }
  // }, [form]);

  const handleSave = useCallback(
    async (data: PersonalityFormData) => {
      setIsSubmitting(true);
      try {
        await onSave(data);
        // Reset form dirty state after successful save
        // setLastSavedData is not needed since we use form.formState.isDirty
        form.reset(data);
        setUnsavedChanges(false);

        // Clear draft if this was a new personality
        if (!isEditMode) {
          try {
            const keys = Object.keys(localStorage).filter((key) =>
              key.startsWith("personality-draft-"),
            );
            keys.forEach((key) => localStorage.removeItem(key));
          } catch (error) {
            console.warn("Failed to clear drafts:", error);
          }
        }
      } catch (error) {
        console.error("Failed to save personality:", error);
        // Error handling could be enhanced with toast notifications
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSave, form, setUnsavedChanges, isEditMode],
  );

  const handleCancel = useCallback(() => {
    // Simplified cancel handler - unsaved changes tracking disabled for now
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
