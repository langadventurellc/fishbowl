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
 *
 * @module components/settings/CreatePersonalityForm
 */

import {
  personalitySchema,
  useUnsavedChanges,
  type CreatePersonalityFormProps,
  type PersonalityFormData,
} from "@fishbowl-ai/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Slider } from "../ui/slider";
import { BehaviorSlidersSection } from "./BehaviorSlidersSection";
import { CustomInstructionsTextarea } from "./CustomInstructionsTextarea";
import { PersonalityNameInput } from "./PersonalityNameInput";

export const CreatePersonalityForm: React.FC<CreatePersonalityFormProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const [bigFiveValues, setBigFiveValues] = useState({
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  });
  const { setUnsavedChanges } = useUnsavedChanges();

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
      name: "",
      bigFive: {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
      },
      behaviors: {
        // Communication Style (default: 50)
        formalityLevel: 50,
        verbosity: 35,
        enthusiasm: 50,
        directness: 50,
        // Interaction Approach (specialized defaults)
        helpfulness: 75,
        patience: 70,
        curiosity: 60,
        empathy: 65,
        // Reasoning Style (specialized defaults)
        analyticalThinking: 70,
        creativity: 60,
        cautionLevel: 60,
        // Response Characteristics (specialized defaults)
        detailLevel: 50,
        questionAsking: 55,
        exampleUsage: 50,
      },
      customInstructions: "",
      ...initialData,
    },
    mode: "onChange",
  });

  // Track unsaved changes - TEMPORARILY DISABLED TO FIX SLIDERS
  // useEffect(() => {
  //   const subscription = form.watch(() => {
  //     setUnsavedChanges(form.formState.isDirty);
  //   });
  //   return () => subscription.unsubscribe();
  // }, [form, setUnsavedChanges]);

  const handleSave = useCallback(
    (data: PersonalityFormData) => {
      onSave(data);
      form.reset(data);
      setUnsavedChanges(false);
    },
    [onSave, form, setUnsavedChanges],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PersonalityNameInput
                  value={field.value}
                  onChange={field.onChange}
                  existingPersonalities={savedPersonalities}
                  showCharacterCounter={true}
                  aria-describedby={`${field.name}-message`}
                />
              </FormControl>
              <FormMessage id={`${field.name}-message`} />
            </FormItem>
          )}
        />

        {/* Big Five Traits */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Big Five Personality Traits</h3>
          {[
            { key: "openness" as const, label: "Openness" },
            { key: "conscientiousness" as const, label: "Conscientiousness" },
            { key: "extraversion" as const, label: "Extraversion" },
            { key: "agreeableness" as const, label: "Agreeableness" },
            { key: "neuroticism" as const, label: "Neuroticism" },
          ].map((trait) => {
            const currentValue = bigFiveValues[trait.key];
            return (
              <div key={trait.key} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">{trait.label}</label>
                  <span className="text-sm text-muted-foreground">
                    {currentValue}
                  </span>
                </div>
                <Slider
                  value={[currentValue]}
                  onValueChange={(value) => {
                    const newValue = value[0] ?? 50;
                    // Update local state immediately for responsive UI
                    setBigFiveValues((prev) => ({
                      ...prev,
                      [trait.key]: newValue,
                    }));
                    // Update form state
                    form.setValue(`bigFive.${trait.key}`, newValue, {
                      shouldDirty: true,
                      shouldValidate: false,
                      shouldTouch: true,
                    });
                  }}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>

        {/* Advanced Behavior Settings */}
        <BehaviorSlidersSection
          values={form.watch("behaviors")}
          onChange={(behavior, value) => {
            form.setValue(`behaviors.${behavior}`, value, {
              shouldDirty: true,
              shouldValidate: false,
              shouldTouch: true,
            });
          }}
        />

        {/* Custom Instructions */}
        <FormField
          control={form.control}
          name="customInstructions"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomInstructionsTextarea
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={500}
                  aria-describedby={`${field.name}-message`}
                />
              </FormControl>
              <FormMessage id={`${field.name}-message`} />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={!form.formState.isDirty}>
            Save Personality
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
