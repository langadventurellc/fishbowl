/**
 * AgentForm component provides comprehensive agent creation and editing interface.
 *
 * Features:
 * - Name input with validation and character counter
 * - Model selection dropdown with predefined options
 * - Role input with validation and character counter
 * - Configuration section with temperature, maxTokens, topP sliders
 * - System prompt textarea with character limit
 * - Form validation with helpful error messages
 * - Unsaved changes tracking
 * - Template mode support with pre-population
 * - Edit mode support with pre-populated data
 * - Comprehensive error handling and user feedback
 * - Unique name validation excluding current agent in edit mode
 *
 * @module components/settings/AgentForm
 */

import { cn } from "@/lib/utils";
import {
  agentSchema,
  useUnsavedChanges,
  type AgentFormData,
  type AgentFormProps,
} from "@fishbowl-ai/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { announceToScreenReader } from "../../utils/announceToScreenReader";
import { getSliderDescription } from "../../utils/sliderDescriptions";
import { createSliderKeyHandler } from "../../utils/sliderKeyboardHandler";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

// Helper functions for configuration descriptions
const getTemperatureDescription = (value: number): string => {
  if (value < 0.3) return "Very focused and deterministic";
  if (value < 0.7) return "Moderately focused";
  if (value < 1.0) return "Balanced creativity";
  if (value < 1.5) return "Creative and varied";
  return "Highly creative and unpredictable";
};

const getTopPDescription = (value: number): string => {
  if (value < 0.5) return "Very focused token selection";
  if (value < 0.9) return "Balanced token diversity";
  return "High token diversity";
};

// Helper function to extract role from template description
const extractRoleFromDescription = (description?: string): string => {
  if (!description) return "";
  return description.split(".")[0] || "";
};

export const AgentForm: React.FC<AgentFormProps> = ({
  mode,
  initialData,
  templateData,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUnsavedChanges } = useUnsavedChanges();
  const isEditMode = mode === "edit";
  const isTemplateMode = mode === "template";

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name:
        initialData?.name ||
        (templateData?.name ? `${templateData.name} Copy` : ""),
      model:
        initialData?.model ||
        templateData?.configuration?.model ||
        "Claude 3.5 Sonnet",
      role:
        initialData?.role ||
        extractRoleFromDescription(templateData?.description) ||
        "",
      configuration: {
        temperature:
          initialData?.configuration?.temperature ||
          templateData?.configuration?.temperature ||
          1.0,
        maxTokens:
          initialData?.configuration?.maxTokens ||
          templateData?.configuration?.maxTokens ||
          1000,
        topP:
          initialData?.configuration?.topP ||
          templateData?.configuration?.topP ||
          0.95,
        systemPrompt:
          initialData?.configuration?.systemPrompt ||
          templateData?.configuration?.systemPrompt ||
          "",
      },
    },
    mode: "onChange",
  });

  // Track unsaved changes
  useEffect(() => {
    setUnsavedChanges(form.formState.isDirty);
  }, [form.formState.isDirty, setUnsavedChanges]);

  const handleSave = useCallback(
    async (data: AgentFormData) => {
      setIsSubmitting(true);
      try {
        await onSave(data);
        // Reset form dirty state after successful save
        form.reset(data);
        setUnsavedChanges(false);
      } catch (error) {
        console.error("Failed to save agent:", error);
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
                <FormLabel htmlFor="agent-name">
                  Agent Name
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="agent-name"
                      {...field}
                      placeholder="Enter a unique name for this agent"
                      disabled={isSubmitting || isLoading}
                      aria-invalid={!!fieldState.error}
                      className={cn(
                        fieldState.error &&
                          "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {field.value && fieldState.error && (
                        <AlertCircle
                          className="h-4 w-4 text-red-600"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
                <div className="text-xs text-right text-muted-foreground">
                  {field.value.length}/50 characters
                </div>
              </FormItem>
            )}
          />

          {/* Model Selection Field */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="agent-model">
                  Model
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id="agent-model"
                      disabled={isSubmitting || isLoading}
                    >
                      <SelectValue placeholder="Select an AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Claude 3.5 Sonnet">
                        Claude 3.5 Sonnet
                      </SelectItem>
                      <SelectItem value="GPT-4">GPT-4</SelectItem>
                      <SelectItem value="Claude 3 Haiku">
                        Claude 3 Haiku
                      </SelectItem>
                      <SelectItem value="GPT-3.5 Turbo">
                        GPT-3.5 Turbo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Field */}
          <FormField
            control={form.control}
            name="role"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="agent-role">
                  Role
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="agent-role"
                    {...field}
                    placeholder="Define the agent's area of expertise and focus"
                    disabled={isSubmitting || isLoading}
                    aria-invalid={!!fieldState.error}
                    className={cn(
                      fieldState.error &&
                        "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
                    )}
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-right text-muted-foreground">
                  {field.value.length}/100 characters
                </div>
              </FormItem>
            )}
          />

          {/* Configuration Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-semibold mb-4">Configuration</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Temperature Slider */}
                  <FormField
                    control={form.control}
                    name="configuration.temperature"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FormLabel className="cursor-help">
                                Temperature
                              </FormLabel>
                            </TooltipTrigger>
                            <TooltipContent>
                              Controls randomness in responses. Lower values are
                              more focused, higher values more creative.
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-sm font-mono font-semibold text-primary">
                            {field.value.toFixed(1)}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            onValueChange={(values) =>
                              field.onChange(values[0])
                            }
                            onKeyDown={createSliderKeyHandler(
                              field.value,
                              0,
                              2,
                              0.1,
                              (value) => field.onChange(value),
                              getSliderDescription.temperature,
                              announceToScreenReader,
                            )}
                            min={0}
                            max={2}
                            step={0.1}
                            className="w-full"
                            disabled={isSubmitting || isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Max Tokens Input */}
                  <FormField
                    control={form.control}
                    name="configuration.maxTokens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Tokens</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1000)
                            }
                            min={1}
                            max={4000}
                            disabled={isSubmitting || isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Top P Slider */}
                  <FormField
                    control={form.control}
                    name="configuration.topP"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FormLabel className="cursor-help">
                                Top P
                              </FormLabel>
                            </TooltipTrigger>
                            <TooltipContent>
                              Controls diversity by limiting token selection.
                              Lower values focus on likely tokens.
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-sm font-mono font-semibold text-primary">
                            {field.value.toFixed(2)}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            onValueChange={(values) =>
                              field.onChange(values[0])
                            }
                            onKeyDown={createSliderKeyHandler(
                              field.value,
                              0,
                              1,
                              0.01,
                              (value) => field.onChange(value),
                              getSliderDescription.topP,
                              announceToScreenReader,
                            )}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full"
                            disabled={isSubmitting || isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Configuration Preview */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold">
                    Configuration Preview
                  </h5>
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="text-sm">
                      <strong>
                        Temperature (
                        {form.watch("configuration.temperature").toFixed(1)}):
                      </strong>{" "}
                      {getTemperatureDescription(
                        form.watch("configuration.temperature"),
                      )}
                    </div>
                    <div className="text-sm">
                      <strong>
                        Max Tokens ({form.watch("configuration.maxTokens")}):
                      </strong>{" "}
                      ~
                      {Math.round(form.watch("configuration.maxTokens") * 0.75)}{" "}
                      words max
                    </div>
                    <div className="text-sm">
                      <strong>
                        Top P ({form.watch("configuration.topP").toFixed(2)}):
                      </strong>{" "}
                      {getTopPDescription(form.watch("configuration.topP"))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <FormField
              control={form.control}
              name="configuration.systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter a system prompt to guide the agent's behavior..."
                      rows={4}
                      disabled={isSubmitting || isLoading}
                      className="resize-none"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <div className="text-xs text-right text-muted-foreground">
                      {field.value?.length || 0}/500 characters
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Template Mode Indicator */}
          {isTemplateMode && templateData && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Creating from template:</strong> {templateData.name}
              </p>
            </div>
          )}

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
                <>
                  {isEditMode
                    ? "Update"
                    : isTemplateMode
                      ? "Create from Template"
                      : "Create"}{" "}
                  Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
