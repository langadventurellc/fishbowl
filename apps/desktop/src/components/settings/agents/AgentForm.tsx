import { cn } from "@/lib/utils";
import {
  agentSchema,
  useUnsavedChanges,
  type AgentFormData,
  type AgentFormProps,
} from "@fishbowl-ai/ui-shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { CharacterCounter, PersonalitySelect, RoleSelect } from "../";
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
import { ModelSelect } from "./ModelSelect";

const buildComposite = (configId: string, modelId: string): string =>
  `${configId}:${modelId}`;

const parseComposite = (
  composite: string,
): { llmConfigId: string; model: string } | null => {
  if (!composite || !composite.includes(":")) {
    return null;
  }
  const [llmConfigId, model] = composite.split(":", 2);
  if (!llmConfigId || !model) {
    return null;
  }
  return { llmConfigId, model };
};

export interface AgentFormRef {
  resetToInitialData: () => void;
}

export const AgentForm = forwardRef<AgentFormRef, AgentFormProps>(
  ({ mode, initialData, onSave, onCancel, isLoading = false }, ref) => {
    const { logger } = useServices();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setUnsavedChanges } = useUnsavedChanges();
    const [selectedComposite, setSelectedComposite] = useState<string>("");

    const getDefaultValues = useCallback((): AgentFormData => {
      if (mode === "edit" && initialData) {
        // Editing mode: use existing agent data
        return {
          name: initialData.name || "",
          model: initialData.model || "Claude 3.5 Sonnet",
          role: initialData.role || "",
          personality: initialData.personality || "",
          systemPrompt: initialData.systemPrompt || "",
          llmConfigId: initialData.llmConfigId || "openai-config-1",
        };
      }

      // Create mode: use store defaults with fallback values
      return {
        name: "",
        model: "Claude 3.5 Sonnet",
        role: "",
        personality: "",
        systemPrompt: "",
        llmConfigId: "openai-config-1",
      };
    }, [mode, initialData]);

    const form = useForm<AgentFormData>({
      resolver: zodResolver(agentSchema),
      defaultValues: getDefaultValues(),
      mode: "onChange",
    });

    // Initialize composite state
    useEffect(() => {
      if (mode === "edit" && initialData?.llmConfigId && initialData?.model) {
        setSelectedComposite(
          buildComposite(initialData.llmConfigId, initialData.model),
        );
      } else {
        setSelectedComposite("");
      }
    }, [mode, initialData]);

    // Handle model selection with composite value splitting
    const handleModelChange = useCallback(
      (compositeValue: string) => {
        setSelectedComposite(compositeValue);

        const parsed = parseComposite(compositeValue);
        if (parsed) {
          form.setValue("llmConfigId", parsed.llmConfigId, {
            shouldValidate: true,
          });
          form.setValue("model", parsed.model, { shouldValidate: true });
        }
      },
      [form],
    );

    // Update form when mode changes (for create mode)
    useEffect(() => {
      if (mode === "create") {
        form.reset(getDefaultValues());
        setSelectedComposite("");
      }
    }, [mode, form, getDefaultValues]);

    // Track unsaved changes
    useEffect(() => {
      setUnsavedChanges(form.formState.isDirty);
    }, [form.formState.isDirty, setUnsavedChanges]);

    // Expose reset function via ref
    useImperativeHandle(
      ref,
      () => ({
        resetToInitialData: () => {
          const defaultValues = getDefaultValues();
          form.reset(defaultValues);
          setUnsavedChanges(false);

          // Reset composite state
          if (
            mode === "edit" &&
            initialData?.llmConfigId &&
            initialData?.model
          ) {
            setSelectedComposite(
              buildComposite(initialData.llmConfigId, initialData.model),
            );
          } else {
            setSelectedComposite("");
          }
        },
      }),
      [form, getDefaultValues, setUnsavedChanges, mode, initialData],
    );

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

          // Update composite state with the saved data
          if (data.llmConfigId && data.model) {
            setSelectedComposite(buildComposite(data.llmConfigId, data.model));
          }
        } catch (error) {
          logger.error("Failed to save agent", error as Error);
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
            {/* Selection Components Section */}
            <div className="space-y-4">
              {/* Model Selection Field */}
              <FormField
                control={form.control}
                name="model"
                render={() => (
                  <FormItem>
                    <FormLabel htmlFor="agent-model">
                      Model
                      <span className="text-red-500 ml-1" aria-hidden="true">
                        *
                      </span>
                    </FormLabel>
                    <FormControl>
                      <ModelSelect
                        value={selectedComposite}
                        onChange={handleModelChange}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hidden LLM Config ID Field for validation */}
              <FormField
                control={form.control}
                name="llmConfigId"
                render={() => (
                  <FormItem className="hidden">
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
            </div>

            {/* Basic Information Section */}
            <div className="space-y-4">
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
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "edit" ? "Save Changes" : "Create Agent"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  },
);

AgentForm.displayName = "AgentForm";
