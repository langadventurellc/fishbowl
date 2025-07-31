import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  defaultGeneralSettings,
  generalSettingsSchema,
  useUnsavedChanges,
  type GeneralSettingsFormData,
} from "@fishbowl-ai/ui-shared";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FormErrorDisplay } from "./FormErrorDisplay";

export const GeneralSettings: React.FC = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { setUnsavedChanges } = useUnsavedChanges();

  // Initialize form with default values and validation
  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: defaultGeneralSettings,
    mode: "onChange", // Enable real-time validation
  });

  // Enhanced form submission with error handling
  const onSubmit = useCallback(
    async (data: GeneralSettingsFormData) => {
      setSubmitError(null);

      try {
        // Validate data one more time
        const validatedData = generalSettingsSchema.parse(data);

        // Log form data for verification during development
        console.log("General Settings submitted:", validatedData);

        // TODO: Integrate with settings store/persistence layer
        // This will be connected to the settings system in future tasks

        // Mark as saved
        setUnsavedChanges(false);
        form.reset(validatedData); // Reset dirty state

        // Success feedback (could use toast notification in the future)
        console.log("Settings saved successfully");
      } catch (error) {
        if (error instanceof Error) {
          setSubmitError(error.message);
        } else {
          setSubmitError("Failed to save settings");
        }
        console.error("Failed to save general settings:", error);
      }
    },
    [form, setUnsavedChanges],
  );

  // Track unsaved changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setUnsavedChanges(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form, setUnsavedChanges]);

  // Add form submission trigger for modal footer
  useEffect(() => {
    const handleSave = () => {
      form.handleSubmit(onSubmit)();
    };

    // Register global save handler
    window.addEventListener("settings-save", handleSave);

    return () => {
      window.removeEventListener("settings-save", handleSave);
    };
  }, [form, onSubmit]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-primary mb-[20px]">General</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Configure general application preferences and behavior.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Hidden submit button for accessibility */}
          <button type="submit" className="sr-only" aria-hidden="true">
            Save Settings
          </button>

          {/* Display submission error */}
          <FormErrorDisplay
            error={submitError}
            onDismiss={() => setSubmitError(null)}
          />

          <div className="space-y-6">
            <h2 className="text-heading-secondary mb-4">Auto Mode Settings</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="responseDelay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Delay</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={30}
                          step={1}
                          value={[field.value / 1000]} // Convert ms to seconds for slider
                          onValueChange={(value) =>
                            field.onChange((value[0] || 1) * 1000)
                          } // Convert seconds to ms
                          className="w-full"
                          aria-describedby="responseDelay-description responseDelay-value"
                          aria-label="Response delay in seconds"
                        />
                        <div
                          id="responseDelay-value"
                          className="text-description text-muted-foreground mt-1"
                          aria-live="polite"
                          aria-atomic="true"
                          role="status"
                        >
                          {field.value / 1000}{" "}
                          {field.value / 1000 === 1 ? "second" : "seconds"}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription
                      id="responseDelay-description"
                      className="text-description text-muted-foreground mt-1"
                    >
                      Time between agent responses in auto mode
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumMessages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Messages</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min={0}
                          max={500}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          onWheel={(e) => e.currentTarget.blur()} // Prevent scroll wheel changes
                          className="w-full"
                        />
                        <div
                          className="text-description text-muted-foreground mt-1"
                          aria-live="polite"
                        >
                          {field.value === 0
                            ? "Unlimited"
                            : `${field.value} message${field.value !== 1 ? "s" : ""}`}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-description text-muted-foreground mt-1">
                      Stop auto mode after this many messages (0 = unlimited)
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumWaitTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Wait Time</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min={5}
                          max={120}
                          {...field}
                          value={field.value / 1000} // Convert ms to seconds for display
                          onChange={(e) =>
                            field.onChange(
                              (parseInt(e.target.value) || 5) * 1000,
                            )
                          } // Convert seconds to ms
                          onWheel={(e) => e.currentTarget.blur()} // Prevent scroll wheel changes
                          className="w-full"
                        />
                        <div
                          className="text-description text-muted-foreground mt-1"
                          aria-live="polite"
                        >
                          {field.value / 1000}{" "}
                          {field.value / 1000 === 1 ? "second" : "seconds"}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-description text-muted-foreground mt-1">
                      Maximum time to wait for agent response
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-heading-secondary mb-4">
              Conversation Defaults
            </h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="defaultMode"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Default Conversation Mode</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                        aria-describedby="defaultMode-description"
                      >
                        <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
                          <RadioGroupItem value="manual" id="mode-manual" />
                          <Label
                            htmlFor="mode-manual"
                            className="text-sm font-normal flex-1 py-2 cursor-pointer"
                          >
                            Manual
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
                          <RadioGroupItem value="auto" id="mode-auto" />
                          <Label
                            htmlFor="mode-auto"
                            className="text-sm font-normal flex-1 py-2 cursor-pointer"
                          >
                            Auto
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription
                      id="defaultMode-description"
                      className="text-description text-muted-foreground mt-1"
                    >
                      Default conversation mode for new conversations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumAgents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Agents</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min={1}
                          max={8}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                          className="w-full"
                        />
                        <div
                          className="text-description text-muted-foreground mt-1"
                          aria-live="polite"
                        >
                          {field.value} agent{field.value !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-description text-muted-foreground mt-1">
                      Limit the number of agents in a conversation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-heading-secondary mb-4">Other Settings</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="checkUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Automatically check for updates
                      </FormLabel>
                      <FormDescription className="text-description text-muted-foreground mt-1">
                        Check for new versions on startup
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
