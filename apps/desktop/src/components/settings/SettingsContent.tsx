/**
 * SettingsContent component provides responsive content area for settings modal.
 *
 * Features:
 * - Responsive padding that adjusts based on screen size
 * - Full width on mobile when navigation is collapsed
 * - Maximum content width constraint for readability
 * - Placeholder content for each settings section
 */

import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "../../lib/utils";
import { getAccessibleDescription } from "@/utils";
import { FormErrorDisplay } from "./FormErrorDisplay";
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
  generalSettingsSchema,
  type GeneralSettingsFormData,
  defaultGeneralSettings,
  useUnsavedChanges,
} from "@fishbowl-ai/shared";

const createProviderSections = (providers: string[]) =>
  providers.map((provider) => (
    <div key={provider} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{provider}</h3>
        <div className="w-2 h-2 bg-muted rounded-full" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">API Key</label>
        <div className="h-10 bg-muted rounded border" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 bg-muted rounded border flex-1" />
        <div className="h-9 bg-muted rounded border w-16" />
      </div>
    </div>
  ));

const GeneralSettings: React.FC = () => {
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
    <div className="space-y-6 max-w-[600px] mx-auto px-4 sm:px-6">
      <div>
        <h1 className="text-[24px] font-bold mb-[20px]">General</h1>
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
            <h2 className="text-[18px] font-semibold mb-4">
              Auto Mode Settings
            </h2>
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
                          className="text-[13px] text-muted-foreground mt-1"
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
                      className="text-[13px] text-muted-foreground mt-1"
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
                          className="text-[13px] text-muted-foreground mt-1"
                          aria-live="polite"
                        >
                          {field.value === 0
                            ? "Unlimited"
                            : `${field.value} message${field.value !== 1 ? "s" : ""}`}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-[13px] text-muted-foreground mt-1">
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
                          className="text-[13px] text-muted-foreground mt-1"
                          aria-live="polite"
                        >
                          {field.value / 1000}{" "}
                          {field.value / 1000 === 1 ? "second" : "seconds"}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-[13px] text-muted-foreground mt-1">
                      Maximum time to wait for agent response
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-[18px] font-semibold mb-4">
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
                        <div className="flex items-center space-x-2 min-h-[44px] py-1">
                          <RadioGroupItem value="manual" id="mode-manual" />
                          <Label
                            htmlFor="mode-manual"
                            className="text-sm font-normal flex-1 py-2 cursor-pointer"
                          >
                            Manual
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 min-h-[44px] py-1">
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
                      className="text-[13px] text-muted-foreground mt-1"
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
                          className="text-[13px] text-muted-foreground mt-1"
                          aria-live="polite"
                        >
                          {field.value} agent{field.value !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-[13px] text-muted-foreground mt-1">
                      Limit the number of agents in a conversation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-[18px] font-semibold mb-4">Other Settings</h2>
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
                      <FormDescription className="text-[13px] text-muted-foreground mt-1">
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

const ApiKeysSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">API Keys</h1>
      <p className="text-muted-foreground mb-6">
        Manage API keys for various AI services and integrations.
      </p>
    </div>
    <div className="space-y-4">
      {createProviderSections([
        "OpenAI",
        "Anthropic",
        "Google",
        "Other Providers",
      ])}
    </div>
  </div>
);

const AppearanceSettings: React.FC = () => {
  // Local state management for theme selection
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >("system");

  // Helper function to get preview colors based on selected theme
  const getPreviewColors = (theme: "light" | "dark" | "system") => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const effectiveTheme = theme === "system" ? systemTheme : theme;

    return effectiveTheme === "dark"
      ? {
          background: "rgb(44, 40, 37)",
          foreground: "rgb(226, 232, 240)",
          border: "rgb(58, 54, 51)",
          primary: "rgb(129, 140, 248)",
          accent: "rgb(72, 68, 65)",
        }
      : {
          background: "rgb(245, 245, 244)",
          foreground: "rgb(30, 41, 59)",
          border: "rgb(214, 211, 209)",
          primary: "rgb(99, 102, 241)",
          accent: "rgb(214, 211, 209)",
        };
  };

  return (
    <div className="space-y-6 max-w-[600px] mx-auto px-4 sm:px-6">
      <div>
        <h1 className="text-[24px] font-bold mb-[20px]">Appearance</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Customize the appearance and theme of the application
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Selection Group */}
        <div className="space-y-4">
          <h2 className="text-[18px] font-semibold mb-4">Theme</h2>
          <div className="grid gap-4">
            <RadioGroup
              value={selectedTheme}
              onValueChange={(value) =>
                setSelectedTheme(value as "light" | "dark" | "system")
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 min-h-[44px] py-1">
                <RadioGroupItem value="light" id="theme-light" />
                <Label
                  htmlFor="theme-light"
                  className="text-sm font-normal flex-1 py-2 cursor-pointer"
                >
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2 min-h-[44px] py-1">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label
                  htmlFor="theme-dark"
                  className="text-sm font-normal flex-1 py-2 cursor-pointer"
                >
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2 min-h-[44px] py-1">
                <RadioGroupItem value="system" id="theme-system" />
                <div className="flex flex-col flex-1 py-2">
                  <Label
                    htmlFor="theme-system"
                    className="text-sm font-normal cursor-pointer"
                  >
                    System
                  </Label>
                  <span className="text-xs text-muted-foreground mt-1">
                    Use your system preference
                  </span>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Theme Preview Area */}
        <div className="space-y-4">
          <h2 className="text-[18px] font-semibold mb-4">Preview</h2>
          <div className="grid gap-4">
            <div
              className="w-[200px] h-[100px] border rounded-lg p-3 flex flex-col justify-between transition-colors"
              style={{
                backgroundColor: getPreviewColors(selectedTheme).background,
                borderColor: getPreviewColors(selectedTheme).border,
                color: getPreviewColors(selectedTheme).foreground,
              }}
              aria-label="Theme preview"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium">Sample Text</div>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: getPreviewColors(selectedTheme).accent,
                  }}
                />
              </div>
              <div className="flex gap-1">
                <div
                  className="h-1 flex-1 rounded"
                  style={{
                    backgroundColor: getPreviewColors(selectedTheme).primary,
                  }}
                />
                <div
                  className="h-1 flex-1 rounded opacity-50"
                  style={{
                    backgroundColor: getPreviewColors(selectedTheme).primary,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentsSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Agents</h1>
      <p className="text-muted-foreground mb-6">
        Configure AI agents and their behavior settings.
      </p>
    </div>
    <div className="border-b">
      <div className="flex space-x-8">
        {["Library", "Templates", "Defaults"].map((tab) => (
          <div key={tab} className="py-2 px-1 border-b-2 border-transparent">
            <span className="text-sm font-medium">{tab}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-10 bg-muted rounded border" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PersonalitiesSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Personalities</h1>
      <p className="text-muted-foreground mb-6">
        Manage agent personalities and their characteristics.
      </p>
    </div>
    <div className="border-b">
      <div className="flex space-x-8">
        {["Saved", "Create New"].map((tab) => (
          <div key={tab} className="py-2 px-1 border-b-2 border-transparent">
            <span className="text-sm font-medium">{tab}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Big Five Personality Traits</h2>
        <div className="space-y-4">
          {[
            "Openness",
            "Conscientiousness",
            "Extraversion",
            "Agreeableness",
            "Neuroticism",
          ].map((trait) => (
            <div key={trait} className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">{trait}</label>
                <span className="text-sm text-muted-foreground">50%</span>
              </div>
              <div className="h-2 bg-muted rounded">
                <div className="h-2 bg-primary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const RolesSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Roles</h1>
      <p className="text-muted-foreground mb-6">
        Define and configure agent roles and permissions.
      </p>
    </div>
    <div className="border-b">
      <div className="flex space-x-8">
        {["Predefined", "Custom"].map((tab) => (
          <div key={tab} className="py-2 px-1 border-b-2 border-transparent">
            <span className="text-sm font-medium">{tab}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {[
        "Developer",
        "Designer",
        "Writer",
        "Analyst",
        "Researcher",
        "Assistant",
      ].map((role) => (
        <div key={role} className="border rounded-lg p-4 space-y-2">
          <h3 className="font-semibold">{role}</h3>
          <p className="text-sm text-muted-foreground">
            Role description and capabilities
          </p>
          <div className="flex gap-2 mt-3">
            <div className="h-8 bg-muted rounded w-16" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdvancedSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Advanced Options</h1>
      <p className="text-muted-foreground mb-6">
        Advanced configuration options for power users.
      </p>
    </div>
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Data Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Export Data", "Import Data", "Clear Data"].map((action) => (
            <div
              key={action}
              className="h-10 bg-muted rounded border flex items-center justify-center"
            >
              <span className="text-sm">{action}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Developer Options</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-muted rounded border" />
            <label className="text-sm">Debug mode</label>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-muted rounded border" />
            <label className="text-sm">Experimental features</label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DefaultSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-6">
        Select a section from the navigation to configure settings.
      </p>
    </div>
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
      <p className="text-sm text-muted-foreground">
        Choose a settings category to get started
      </p>
    </div>
  </div>
);

const sectionComponents = {
  general: GeneralSettings,
  "api-keys": ApiKeysSettings,
  appearance: AppearanceSettings,
  agents: AgentsSettings,
  personalities: PersonalitiesSettings,
  roles: RolesSettings,
  advanced: AdvancedSettings,
} as const;

interface SettingsContentProps {
  activeSection: string;
  className?: string;
  contentId?: string; // New prop for ARIA relationships
}

export function SettingsContent({
  activeSection,
  className,
  contentId = "settings-content",
}: SettingsContentProps) {
  const Component =
    sectionComponents[activeSection as keyof typeof sectionComponents] ||
    DefaultSettings;

  // Get accessible description for current section
  const sectionDescription = getAccessibleDescription(activeSection);

  return (
    <main
      className={cn(
        // Base content styling
        "flex-1 overflow-y-scroll",
        // Responsive padding: 30px desktop, 20px reduced screens
        "min-[1000px]:p-[30px]",
        "max-[999px]:p-[20px]",
        // Full width when navigation is hidden/collapsed
        "max-[799px]:w-full",
        // Takes remaining width when navigation is visible
        "min-[800px]:flex-1",
        // Background for content area
        "bg-background",
        className,
      )}
      role="main"
      aria-label={`${activeSection} settings`}
      aria-describedby={`${contentId}-description`}
      aria-live="polite"
      aria-busy="false"
      id={contentId}
      tabIndex={-1}
    >
      {/* Hidden description for screen readers */}
      <div id={`${contentId}-description`} className="sr-only">
        {sectionDescription}. Use Tab to navigate between form controls. Changes
        are automatically saved.
      </div>

      {/* Section heading for screen readers */}
      <h2 className="sr-only">{activeSection} Settings Section</h2>

      {/* Maximum content width container with region role */}
      <div
        className="max-w-[600px] mx-auto"
        role="region"
        aria-labelledby={`${contentId}-section-title`}
      >
        {/* Dynamic section title for screen readers */}
        <h3 id={`${contentId}-section-title`} className="sr-only">
          Configure {activeSection} settings
        </h3>

        {/* Form wrapper with proper ARIA attributes */}
        <div
          role="group"
          aria-labelledby={`${contentId}-section-title`}
          aria-describedby={`${contentId}-description`}
        >
          <Component />
        </div>
      </div>
    </main>
  );
}
