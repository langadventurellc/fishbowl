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

const llmConfigSchema = z.object({
  customName: z.string().min(1, "Custom name is required"),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Must be a valid URL"),
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
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        form.handleSubmit(handleSave)();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, form, handleSave]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="llm-config-modal max-w-lg z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle>Configure {providerName}</DialogTitle>
          <DialogDescription>
            Set up your {providerName} API configuration
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
                        onClick={() => setShowApiKey(!showApiKey)}
                        aria-label={
                          showApiKey ? "Hide API key" : "Show API key"
                        }
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
      </DialogContent>
    </Dialog>
  );
};
