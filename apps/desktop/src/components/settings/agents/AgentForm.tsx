import { cn } from "@/lib/utils";
import {
  agentSchema,
  useUnsavedChanges,
  type AgentFormData,
  type AgentFormProps,
} from "@fishbowl-ai/ui-shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CharacterCounter,
  ModelSelect,
  PersonalitySelect,
  RoleSelect,
} from "../";
import { useServices } from "../../../contexts";
import { getSliderDescription } from "../../../utils/sliderDescriptions";
import { Button } from "../../ui/button";
import { ConfirmationDialog } from "../../ui/confirmation-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Slider } from "../../ui/slider";
import { Textarea } from "../../ui/textarea";

export const AgentForm: React.FC<AgentFormProps> = ({
  mode,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const { logger } = useServices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const { setUnsavedChanges } = useUnsavedChanges();
  const isEditMode = mode === "edit";

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: initialData?.name || "",
      model: initialData?.model || "Claude 3.5 Sonnet",
      role: initialData?.role || "",
      personality: initialData?.personality || "",
      temperature: initialData?.temperature || 1.0,
      maxTokens: initialData?.maxTokens || 1000,
      topP: initialData?.topP || 0.95,
      systemPrompt: initialData?.systemPrompt || "",
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
        // Reset form with new values after successful save
        form.reset(data, {
          keepDefaultValues: false,
          keepDirty: false,
          keepErrors: false,
        });
        setUnsavedChanges(false);
      } catch (error) {
        logger.error("Failed to save agent", error as Error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSave, form, setUnsavedChanges, logger],
  );

  const handleCancel = useCallback(() => {
    if (form.formState.isDirty) {
      setShowUnsavedDialog(true);
    } else {
      setUnsavedChanges(false);
      onCancel();
    }
  }, [form.formState.isDirty, setUnsavedChanges, onCancel]);

  const handleConfirmCancel = useCallback(() => {
    // Reset form to original values
    form.reset(
      initialData || {
        name: "",
        model: "Claude 3.5 Sonnet",
        role: "",
        personality: "",
        temperature: 1.0,
        maxTokens: 1000,
        topP: 0.95,
        systemPrompt: "",
      },
    );
    setUnsavedChanges(false);
    setShowUnsavedDialog(false);
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
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="agent-name">
                    Agent Name
                    <span className="text-red-500 ml-1" aria-hidden="true">
                      *
                    </span>
                  </FormLabel>
                  <CharacterCounter
                    current={form.watch("name")?.length || 0}
                    max={100}
                  />
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="agent-name"
                      {...field}
                      placeholder="Enter a unique name for this agent"
                      maxLength={100}
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
                  <ModelSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting || isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Field */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Role
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <RoleSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select a role"
                    disabled={isSubmitting || isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Personality Field */}
          <FormField
            control={form.control}
            name="personality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Personality
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <PersonalitySelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select a personality"
                    disabled={isSubmitting || isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Configuration Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-semibold mb-4">Configuration</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Temperature Field */}
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Temperature</FormLabel>
                          <span className="text-sm text-muted-foreground">
                            {field.value?.toFixed(1)} -{" "}
                            {getSliderDescription.temperature(field.value || 0)}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value || 0]}
                            onValueChange={(values: number[]) =>
                              field.onChange(values[0])
                            }
                            min={0}
                            max={2}
                            step={0.1}
                            disabled={isSubmitting || isLoading}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Max Tokens Field */}
                  <FormField
                    control={form.control}
                    name="maxTokens"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Max Tokens</FormLabel>
                          <span className="text-sm text-muted-foreground">
                            {getSliderDescription.maxTokens(
                              field.value || 1000,
                            )}
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                            min={1}
                            max={4000}
                            placeholder="1000"
                            disabled={isSubmitting || isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Top P Field */}
                  <FormField
                    control={form.control}
                    name="topP"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Top P</FormLabel>
                          <span className="text-sm text-muted-foreground">
                            {field.value?.toFixed(2)} -{" "}
                            {getSliderDescription.topP(field.value || 1)}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value || 1]}
                            onValueChange={(values: number[]) =>
                              field.onChange(values[0])
                            }
                            min={0}
                            max={1}
                            step={0.01}
                            disabled={isSubmitting || isLoading}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>System Prompt (Optional)</FormLabel>
                    <CharacterCounter
                      current={form.watch("systemPrompt")?.length || 0}
                      max={5000}
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter a system prompt to guide the agent's behavior..."
                      maxLength={5000}
                      rows={4}
                      disabled={isSubmitting || isLoading}
                      className="resize-none min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
              className="min-w-[var(--dt-button-min-width)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{isEditMode ? "Update" : "Create"} Agent</>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Unsaved Changes Confirmation Dialog */}
      <ConfirmationDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        title="Unsaved Changes"
        message="You have unsaved changes that will be lost if you continue. Are you sure you want to cancel?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        onConfirm={handleConfirmCancel}
        variant="destructive"
      />
    </div>
  );
};
