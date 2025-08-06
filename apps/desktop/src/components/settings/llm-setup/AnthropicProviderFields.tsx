import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { useAccessibilityAnnouncements } from "../../../utils";
import { LlmConfigFormData } from "./LlmConfigModal";

interface AnthropicProviderFieldsProps {
  control: Control<LlmConfigFormData>;
}

export const AnthropicProviderFields: React.FC<
  AnthropicProviderFieldsProps
> = ({ control }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const { announceStateChange } = useAccessibilityAnnouncements();

  return (
    <>
      {/* API Key Field */}
      <FormField
        control={control}
        name="apiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>API Key</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Anthropic API key"
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
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
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
        control={control}
        name="baseUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Base URL (Optional)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="url"
                placeholder="https://api.anthropic.com"
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
        control={control}
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
    </>
  );
};
