import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { LlmConfigModalProps } from "./LlmConfigModalProps";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { useGlobalKeyboardShortcuts } from "../../../hooks/useGlobalKeyboardShortcuts";
import {
  generateDialogAriaIds,
  useAccessibilityAnnouncements,
} from "../../../utils";

const llmConfigSchema = z.object({
  customName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string(),
  useAuthHeader: z.boolean(),
});

type LlmConfigFormData = z.infer<typeof llmConfigSchema>;

export const LlmConfigModal: React.FC<LlmConfigModalProps> = ({
  isOpen,
  onOpenChange,
  provider,
  initialData,
  onSave,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

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
    return provider === "openai"
      ? "https://api.openai.com/v1"
      : "https://api.anthropic.com";
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
      onSave(data);
      onOpenChange(false);
    },
    [onSave, onOpenChange],
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
      setShowApiKey(false);
    }
  }, [isOpen, provider, initialData, form, getDefaultBaseUrl]);

  const providerName = provider === "openai" ? "OpenAI" : "Anthropic";

  // Announce modal open to screen readers
  useEffect(() => {
    if (isOpen) {
      announceStateChange(
        `Configure ${providerName} dialog opened. Fill in the form fields and press Control S to save or Escape to cancel.`,
      );
    }
  }, [isOpen, providerName, announceStateChange]);

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
          <DialogTitle id={ariaIds.titleId}>
            Configure {providerName}
          </DialogTitle>
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
                      placeholder="e.g., My ChatGPT API"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* API Key Field */}
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showApiKey ? "text" : "password"}
                        placeholder="Enter your API key"
                        className="pr-10"
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent h-8 w-8"
                        onClick={() => {
                          const newState = !showApiKey;
                          setShowApiKey(newState);
                          announceStateChange(
                            newState
                              ? "API key is now visible"
                              : "API key is now hidden",
                          );
                        }}
                        aria-label={
                          showApiKey ? "Hide API key" : "Show API key"
                        }
                        aria-pressed={showApiKey}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Base URL Field */}
            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder={getDefaultBaseUrl}
                      autoComplete="url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Authorization Header Checkbox */}
            <FormField
              control={form.control}
              name="useAuthHeader"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Send API key in authorization header</FormLabel>
                  </div>
                </FormItem>
              )}
            />

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
