import { LlmConfigModalProps } from "@fishbowl-ai/ui-shared/src/types/settings/LlmConfigModalProps";
import type { Provider } from "@fishbowl-ai/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { useGlobalKeyboardShortcuts } from "../../../hooks/useGlobalKeyboardShortcuts";
import {
  generateDialogAriaIds,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { OpenAiProviderFields } from "./OpenAiProviderFields";
import { AnthropicProviderFields } from "./AnthropicProviderFields";
import { GoogleProviderFields } from "./GoogleProviderFields";
import { CustomProviderFields } from "./CustomProviderFields";

const llmConfigSchema = z.object({
  customName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string(),
  useAuthHeader: z.boolean(),
});

export type LlmConfigFormData = z.infer<typeof llmConfigSchema>;

export const LlmConfigModal: React.FC<LlmConfigModalProps> = ({
  isOpen,
  onOpenChange,
  provider,
  mode = "add",
  initialData,
  onSave,
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
      case "google":
        return "https://generativelanguage.googleapis.com";
      case "custom":
        return "";
    }
  }, [provider]);

  const form = useForm<LlmConfigFormData>({
    resolver: zodResolver(llmConfigSchema),
    defaultValues: {
      customName: initialData?.customName || "",
      apiKey: initialData?.apiKey || "",
      baseUrl: initialData?.baseUrl || getDefaultBaseUrl,
      useAuthHeader: initialData?.useAuthHeader || false,
    },
  });

  const handleSave = useCallback(
    (data: LlmConfigFormData) => {
      // Include ID and provider when editing
      const saveData =
        mode === "edit" && initialData?.id
          ? { ...data, provider, id: initialData.id }
          : { ...data, provider };
      onSave(saveData);
      onOpenChange(false);
    },
    [onSave, onOpenChange, mode, initialData?.id, provider],
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Keyboard shortcuts
  useGlobalKeyboardShortcuts({
    shortcuts: {
      Escape: handleCancel,
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
        apiKey: initialData?.apiKey || "",
        baseUrl: initialData?.baseUrl || getDefaultBaseUrl,
        useAuthHeader: initialData?.useAuthHeader || false,
      });
    }
  }, [isOpen, provider, initialData, form, getDefaultBaseUrl]);

  const getProviderName = (provider: Provider): string => {
    switch (provider) {
      case "openai":
        return "OpenAI";
      case "anthropic":
        return "Anthropic";
      case "google":
        return "Google AI";
      case "custom":
        return "Custom Provider";
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
      >
        <DialogHeader>
          <DialogTitle id={ariaIds.titleId}>{modalTitle}</DialogTitle>
          <DialogDescription id={ariaIds.descriptionId}>
            Set up your {providerName} API configuration. Press Escape to cancel
            or Ctrl+S (Cmd+S on Mac) to save.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {/* Custom Name Field */}
            <FormField
              control={form.control}
              name="customName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`e.g., My ${providerName} API`}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Provider-specific fields */}
            {provider === "openai" ? (
              <OpenAiProviderFields control={form.control} />
            ) : provider === "anthropic" ? (
              <AnthropicProviderFields control={form.control} />
            ) : provider === "google" ? (
              <GoogleProviderFields control={form.control} />
            ) : (
              <CustomProviderFields control={form.control} />
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
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
