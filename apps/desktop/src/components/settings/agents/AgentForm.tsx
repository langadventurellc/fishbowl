import { cn } from "@/lib/utils";
import {
  agentSchema,
  getMaxTokensDescription,
  getTemperatureDescription,
  getTopPDescription,
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
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
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
        form.reset(data);
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
                  <CharacterCounter current={field.value.length} max={100} />
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
                        <FormLabel>
                          Temperature ({field.value.toFixed(1)})
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="range"
                              min={0}
                              max={2}
                              step={0.1}
                              {...field}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              disabled={isSubmitting || isLoading}
                              className="w-full"
                            />
                            <div className="text-xs text-muted-foreground">
                              {getTemperatureDescription(field.value)}
                            </div>
                          </div>
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
                        <FormLabel>Max Tokens</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
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
                            <div className="text-xs text-muted-foreground">
                              {getMaxTokensDescription(field.value)}
                            </div>
                          </div>
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
                        <FormLabel>Top P ({field.value.toFixed(2)})</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              {...field}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              disabled={isSubmitting || isLoading}
                              className="w-full"
                            />
                            <div className="text-xs text-muted-foreground">
                              {getTopPDescription(field.value)}
                            </div>
                          </div>
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
                      <CharacterCounter
                        current={field.value?.length || 0}
                        max={5000}
                      />
                    </div>
                  </div>
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
    </div>
  );
};
