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

import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  useUnsavedChanges,
  personalitySchema,
  type PersonalityFormData,
  type CreatePersonalityFormProps,
} from "@fishbowl-ai/shared";

export const CreatePersonalityForm: React.FC<CreatePersonalityFormProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const [isBehaviorsExpanded, setIsBehaviorsExpanded] = useState(false);
  const { setUnsavedChanges } = useUnsavedChanges();

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
        creativity: 50,
        analytical: 50,
        empathy: 50,
        assertiveness: 50,
        patience: 50,
        curiosity: 50,
        reliability: 50,
        flexibility: 50,
        independence: 50,
        collaboration: 50,
        attention_to_detail: 50,
        risk_tolerance: 50,
        communication_style: 50,
        decision_making: 50,
      },
      customInstructions: "",
      ...initialData,
    },
    mode: "onChange",
  });

  // Track unsaved changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setUnsavedChanges(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form, setUnsavedChanges]);

  const handleSave = useCallback(
    (data: PersonalityFormData) => {
      onSave(data);
      form.reset(data);
      setUnsavedChanges(false);
    },
    [onSave, form, setUnsavedChanges],
  );

  const bigFiveTraits = [
    { key: "openness" as const, label: "Openness" },
    { key: "conscientiousness" as const, label: "Conscientiousness" },
    { key: "extraversion" as const, label: "Extraversion" },
    { key: "agreeableness" as const, label: "Agreeableness" },
    { key: "neuroticism" as const, label: "Neuroticism" },
  ];

  const behaviorTraits = [
    { key: "creativity", label: "Creativity" },
    { key: "analytical", label: "Analytical Thinking" },
    { key: "empathy", label: "Empathy" },
    { key: "assertiveness", label: "Assertiveness" },
    { key: "patience", label: "Patience" },
    { key: "curiosity", label: "Curiosity" },
    { key: "reliability", label: "Reliability" },
    { key: "flexibility", label: "Flexibility" },
    { key: "independence", label: "Independence" },
    { key: "collaboration", label: "Collaboration" },
    { key: "attention_to_detail", label: "Attention to Detail" },
    { key: "risk_tolerance", label: "Risk Tolerance" },
    { key: "communication_style", label: "Communication Style" },
    { key: "decision_making", label: "Decision Making" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personality Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter personality name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Big Five Traits */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Big Five Personality Traits</h3>
          {bigFiveTraits.map((trait) => (
            <FormField
              key={trait.key}
              control={form.control}
              name={`bigFive.${trait.key}`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>{trait.label}</FormLabel>
                    <span className="text-sm text-muted-foreground">
                      {field.value}
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* Collapsible Behavior Sliders */}
        <Collapsible
          open={isBehaviorsExpanded}
          onOpenChange={setIsBehaviorsExpanded}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 h-auto"
              type="button"
            >
              <span className="text-lg font-semibold">Behavior Sliders</span>
              {isBehaviorsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {behaviorTraits.map((trait) => (
              <FormField
                key={trait.key}
                control={form.control}
                name={`behaviors.${trait.key}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>{trait.label}</FormLabel>
                      <span className="text-sm text-muted-foreground">
                        {field.value}
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Custom Instructions */}
        <FormField
          control={form.control}
          name="customInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Instructions</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Enter custom instructions for this personality..."
                />
              </FormControl>
              <FormMessage />
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
