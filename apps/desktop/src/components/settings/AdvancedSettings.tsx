import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useUnsavedChanges } from "@fishbowl-ai/ui-shared";
import { AlertTriangle } from "lucide-react";
import React, { useEffect } from "react";
import type { AdvancedSettingsProps } from "../../types/AdvancedSettingsProps";

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  form,
  isLoading: _isLoading = false,
  error: _error = null,
}) => {
  const { setUnsavedChanges } = useUnsavedChanges();

  // Apply debug logging immediately when toggled
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "debugLogging" && value.debugLogging !== undefined) {
        window.electronAPI?.settings?.setDebugLogging?.(value.debugLogging);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-primary mb-[20px]">Advanced Settings</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Advanced configuration options for power users.
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6" data-testid="advanced-settings-form">
          <div className="space-y-4">
            <h2 className="text-heading-secondary mb-4">Developer Options</h2>
            <div className="grid gap-6">
              {/* Debug Logging Field */}
              <FormField
                control={form.control}
                name="debugLogging"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable debug logging
                      </FormLabel>
                      <div className="text-description text-muted-foreground">
                        Show detailed logs in developer console
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          setUnsavedChanges(true);
                        }}
                        aria-describedby="debug-help"
                        aria-label="Toggle debug logging on or off"
                        data-testid="debug-logging-switch"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Experimental Features Field */}
              <FormField
                control={form.control}
                name="experimentalFeatures"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable experimental features
                      </FormLabel>
                      <div className="text-description text-muted-foreground">
                        Access features currently in development
                      </div>
                      <div
                        role="alert"
                        className="text-description text-amber-600 dark:text-amber-400 flex items-center gap-1"
                      >
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        May cause instability
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          setUnsavedChanges(true);
                        }}
                        aria-describedby="experimental-help experimental-warning"
                        aria-label="Toggle experimental features with instability risk"
                        data-testid="experimental-features-switch"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};
