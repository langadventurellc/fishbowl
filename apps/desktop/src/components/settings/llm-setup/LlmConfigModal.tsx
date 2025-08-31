import type { LlmConfigInput, Provider } from "@fishbowl-ai/shared";
import { LlmConfigModalProps } from "@fishbowl-ai/ui-shared/src/types/settings/LlmConfigModalProps";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { useGlobalKeyboardShortcuts } from "../../../hooks/useGlobalKeyboardShortcuts";
import { cn } from "../../../lib/utils";
import {
  generateDialogAriaIds,
  isMaskedApiKey,
  maskApiKey,
  useAccessibilityAnnouncements,
} from "../../../utils";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { AnthropicProviderFields } from "./AnthropicProviderFields";
import { OpenAiProviderFields } from "./OpenAiProviderFields";

// Local form schema that exactly matches our form needs
const createLlmConfigFormSchema = (mode: "add" | "edit") =>
  z.object({
    customName: z.string().min(1, "Custom name is required"),
    apiKey: z
      .string()
      .min(1, "API key is required")
      .refine((value) => {
        // In edit mode, allow masked API keys to pass validation
        if (mode === "edit" && isMaskedApiKey(value)) {
          return true;
        }
        // In add mode or when actually changing the API key, require a real key
        return value.length > 0;
      }, "API key is required"),
    provider: z.enum(["openai", "anthropic"]),
    baseUrl: z.string().optional(),
    useAuthHeader: z.boolean(),
  });

export type LlmConfigFormData = z.infer<
  ReturnType<typeof createLlmConfigFormSchema>
>;

export const LlmConfigModal: React.FC<LlmConfigModalProps> = ({
  isOpen,
  onOpenChange,
  provider,
  mode = "add",
  initialData,
  onSave,
  isLoading = false,
  error = null,
  existingConfigs: _existingConfigs = [],
}) => {
  // Generate consistent ARIA IDs
  const ariaIds = generateDialogAriaIds(`llm-config-modal-${provider}`);

  // Accessibility announcements
  const { announceStateChange } = useAccessibilityAnnouncements();

  // Focus management
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    restoreFocus: true,
    initialFocusSelector: '[name="customName"]',
  });

  const getDefaultBaseUrl = useMemo(() => {
    switch (provider) {
      case "openai":
        return "https://api.openai.com/v1";
      case "anthropic":
        return "https://api.anthropic.com";
    }
  }, [provider]);

  // Store original API key for comparison
  const originalApiKey = useMemo(() => {
    return mode === "edit" && initialData?.apiKey ? initialData.apiKey : null;
  }, [mode, initialData?.apiKey]);

  // Get the display value for API key (masked in edit mode)
  const getApiKeyDisplayValue = useMemo(() => {
    if (mode === "edit" && originalApiKey) {
      return maskApiKey(originalApiKey);
    }
    return initialData?.apiKey || "";
  }, [mode, originalApiKey, initialData?.apiKey]);

  const form = useForm<LlmConfigFormData>({
    resolver: zodResolver(createLlmConfigFormSchema(mode)),
    mode: "onChange", // Enable form validation
    defaultValues: {
      customName: initialData?.customName || "",
      apiKey: getApiKeyDisplayValue,
      provider,
      baseUrl: initialData?.baseUrl || undefined,
      useAuthHeader: initialData?.useAuthHeader ?? false,
    },
  });

  const handleSave = useCallback(
    async (data: LlmConfigFormData) => {
      try {
        // For edit mode, check if API key was actually changed
        const apiKeyToSave =
          mode === "edit" && isMaskedApiKey(data.apiKey)
            ? originalApiKey // Keep original if not changed
            : data.apiKey; // Use new value if changed

        // Convert to shared LlmConfigInput type
        const llmConfigData: LlmConfigInput = {
          customName: data.customName,
          apiKey: apiKeyToSave!,
          provider: data.provider,
          baseUrl: data.baseUrl,
          useAuthHeader: data.useAuthHeader,
        };

        // Include ID when editing
        const saveData =
          mode === "edit" && initialData?.id
            ? { ...llmConfigData, id: initialData.id }
            : llmConfigData;

        await onSave(saveData);
        // Only close if save succeeds
        onOpenChange(false);
      } catch (error) {
        // Error handled by parent component through error prop
        // Modal stays open to show validation errors
        console.error("Save failed:", error);
      }
    },
    [onSave, onOpenChange, mode, initialData?.id, originalApiKey],
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Keyboard shortcuts (Escape handled in DialogContent onKeyDown)
  useGlobalKeyboardShortcuts({
    shortcuts: {
      "Ctrl+S": () => form.handleSubmit(handleSave)(),
      "Meta+S": () => form.handleSubmit(handleSave)(),
    },
    enabled: isOpen,
    preventDefault: true,
  });

  // Reset form when modal opens/closes or provider changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        customName: initialData?.customName || "",
        apiKey: getApiKeyDisplayValue,
        provider,
        baseUrl: initialData?.baseUrl || undefined,
        useAuthHeader: initialData?.useAuthHeader ?? false,
      });
    }
  }, [
    isOpen,
    provider,
    initialData,
    form,
    getDefaultBaseUrl,
    getApiKeyDisplayValue,
  ]);

  const getProviderName = (provider: Provider): string => {
    switch (provider) {
      case "openai":
        return "OpenAI";
      case "anthropic":
        return "Anthropic";
      default:
        return "Unknown Provider";
    }
  };

  const providerName = getProviderName(provider);

  // Generate dynamic modal title based on mode
  const modalTitle =
    mode === "edit" && initialData?.customName
      ? `Edit ${initialData.customName}`
      : "Setup LLM API";

  // Announce modal open to screen readers
  useEffect(() => {
    if (isOpen) {
      const action = mode === "edit" ? "Edit" : "Configure";
      announceStateChange(
        `${action} ${providerName} dialog opened. Fill in the form fields and press Control S to save or Escape to cancel.`,
      );
    }
  }, [isOpen, providerName, mode, announceStateChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        ref={containerRef}
        className="llm-config-modal max-w-lg z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
        aria-labelledby={ariaIds.titleId}
        aria-describedby={ariaIds.descriptionId}
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            handleCancel();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle id={ariaIds.titleId}>{modalTitle}</DialogTitle>
          <DialogDescription id={ariaIds.descriptionId}>
            Set up your {providerName} API configuration. Press Escape to cancel
            or Ctrl+S (Cmd+S on Mac) to save.
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Configuration Error
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {/* Custom Name Field */}
            <FormField
              control={form.control}
              name="customName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Custom Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`e.g., My ${providerName} API`}
                      className={cn(fieldState.error ? "border-red-500" : "")}
                      autoComplete="off"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between">
                    <span className="text-muted-foreground">
                      A unique name to identify this configuration
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        field.value?.length > 90
                          ? "text-yellow-600"
                          : "text-muted-foreground",
                      )}
                    >
                      {field.value?.length || 0}/100
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Provider-specific fields */}
            {provider === "openai" ? (
              <OpenAiProviderFields control={form.control} />
            ) : provider === "anthropic" ? (
              <AnthropicProviderFields control={form.control} />
            ) : (
              <p>Unsupported provider: {provider}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : mode === "add" ? (
                  "Add Configuration"
                ) : (
                  "Update Configuration"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Live region for form announcements */}
        <div
          id={ariaIds.announcementId}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </DialogContent>
    </Dialog>
  );
};
