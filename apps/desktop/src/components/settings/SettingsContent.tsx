/**
 * SettingsContent component provides responsive content area for settings modal.
 *
 * Features:
 * - Responsive padding that adjusts based on screen size
 * - Full width on mobile when navigation is collapsed
 * - Maximum content width constraint for readability
 * - Placeholder content for each settings section
 */

import { Button } from "@/components/ui/button";
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
import { getAccessibleDescription } from "@/utils";
import {
  defaultGeneralSettings,
  generalSettingsSchema,
  useUnsavedChanges,
  type GeneralSettingsFormData,
  type ThemePreviewProps,
  type FontSizePreviewProps,
  type SettingsContentProps,
} from "@fishbowl-ai/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Download, Trash2, Upload } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "../../lib/utils";
import { ApiKeysSettings } from "./ApiKeysSettings";
import { AgentsSection } from "./AgentsSection";
import { FormErrorDisplay } from "./FormErrorDisplay";
import { PersonalitiesSection } from "./PersonalitiesSection";
import { RolesSection } from "./RolesSection";

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

// ThemePreview component with React.memo for performance optimization

const ThemePreview = React.memo<ThemePreviewProps>(({ selectedTheme }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Apply theme class to preview container for CSS variable resolution
  useEffect(() => {
    const previewElement = previewRef.current;
    if (!previewElement) return;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const effectiveTheme =
      selectedTheme === "system" ? systemTheme : selectedTheme;

    // Apply theme class directly to preview element
    previewElement.classList.toggle("dark", effectiveTheme === "dark");
  }, [selectedTheme]);

  return (
    <div
      ref={previewRef}
      className="theme-preview border rounded-lg p-3 flex flex-col justify-between"
      aria-label="Theme preview showing background, text, and accent colors"
      role="img"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium">Sample Text</div>
        <div
          className="theme-preview-accent w-2 h-2 rounded-full"
          aria-hidden="true"
        />
      </div>
      <div className="flex gap-1" aria-hidden="true">
        <div className="theme-preview-primary h-1 flex-1 rounded" />
        <div className="theme-preview-primary h-1 flex-1 rounded opacity-50" />
      </div>
    </div>
  );
});

ThemePreview.displayName = "ThemePreview";

// FontSizePreview component with React.memo for performance optimization

const FontSizePreview = React.memo<FontSizePreviewProps>(({ fontSize }) => {
  return (
    <div className="mt-4 p-3 border rounded-lg bg-muted/30">
      <div
        className="text-foreground transition-all duration-150 ease-in-out"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.5,
        }}
        aria-label={`Font size preview at ${fontSize} pixels`}
        role="text"
      >
        This is how your messages will appear
      </div>
    </div>
  );
});

FontSizePreview.displayName = "FontSizePreview";

const AppearanceSettings: React.FC = () => {
  // Local state management for theme selection
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >("system");

  // Local state management for display settings
  const [showTimestamps, setShowTimestamps] = useState<
    "always" | "hover" | "never"
  >("hover");
  const [showActivityTime, setShowActivityTime] = useState(true);
  const [compactList, setCompactList] = useState(false);

  // Local state management for chat display settings
  const [fontSize, setFontSize] = useState<number[]>([14]);
  const [messageSpacing, setMessageSpacing] = useState<
    "compact" | "normal" | "relaxed"
  >("normal");

  // Optimized event handlers with useCallback
  const handleThemeChange = useCallback((value: string) => {
    setSelectedTheme(value as "light" | "dark" | "system");
  }, []);

  const handleFontSizeChange = useCallback((value: number[]) => {
    setFontSize(value);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-primary mb-[20px]">Appearance</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Customize the appearance and theme of the application
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Selection Group */}
        <div className="space-y-4">
          <h2 className="text-heading-secondary mb-4">Theme</h2>
          <div className="grid gap-4">
            <RadioGroup
              value={selectedTheme}
              onValueChange={handleThemeChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
                <RadioGroupItem value="light" id="theme-light" />
                <Label
                  htmlFor="theme-light"
                  className="text-sm font-normal flex-1 py-2 cursor-pointer"
                >
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label
                  htmlFor="theme-dark"
                  className="text-sm font-normal flex-1 py-2 cursor-pointer"
                >
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
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
          <h2 className="text-heading-secondary mb-4">Preview</h2>
          <div className="grid gap-4">
            <ThemePreview selectedTheme={selectedTheme} />
          </div>
        </div>

        {/* Display Settings Group */}
        <div className="space-y-4">
          <h2 className="text-heading-secondary mb-4">Display Settings</h2>
          <div className="grid gap-6">
            {/* Message Timestamps Control */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Show Timestamps</Label>
              <RadioGroup
                value={showTimestamps}
                onValueChange={(value) =>
                  setShowTimestamps(value as "always" | "hover" | "never")
                }
                className="flex flex-col space-y-2"
                aria-describedby="timestamps-description"
              >
                <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
                  <RadioGroupItem value="always" id="timestamps-always" />
                  <Label
                    htmlFor="timestamps-always"
                    className="text-sm font-normal flex-1 py-2 cursor-pointer"
                  >
                    Always
                  </Label>
                </div>
                <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
                  <RadioGroupItem value="hover" id="timestamps-hover" />
                  <Label
                    htmlFor="timestamps-hover"
                    className="text-sm font-normal flex-1 py-2 cursor-pointer"
                  >
                    On Hover
                  </Label>
                </div>
                <div className="flex items-center space-x-2 min-h-[var(--dt-touch-min-mobile)] py-1">
                  <RadioGroupItem value="never" id="timestamps-never" />
                  <Label
                    htmlFor="timestamps-never"
                    className="text-sm font-normal flex-1 py-2 cursor-pointer"
                  >
                    Never
                  </Label>
                </div>
              </RadioGroup>
              <div
                id="timestamps-description"
                className="text-description text-muted-foreground mt-1"
              >
                Control when message timestamps are displayed
              </div>
            </div>

            {/* Conversation List Toggle Controls */}
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label className="text-base">Show last activity time</Label>
                  <div className="text-description text-muted-foreground">
                    Display the last activity time for each conversation
                  </div>
                </div>
                <Switch
                  checked={showActivityTime}
                  onCheckedChange={setShowActivityTime}
                  aria-describedby="activity-time-description"
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label className="text-base">Compact conversation list</Label>
                  <div className="text-description text-muted-foreground">
                    Use a more compact layout for the conversation list
                  </div>
                </div>
                <Switch
                  checked={compactList}
                  onCheckedChange={setCompactList}
                  aria-describedby="compact-list-description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Display Group */}
        <div className="space-y-4">
          <h2 className="text-heading-secondary mb-4">Chat Display</h2>
          <div className="grid gap-6">
            {/* Font Size Slider Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Message Font Size</Label>
                <span className="text-sm text-muted-foreground">
                  {fontSize[0]}px
                </span>
              </div>
              <Slider
                value={fontSize}
                onValueChange={handleFontSizeChange}
                min={12}
                max={18}
                step={1}
                className="w-full"
                aria-label="Message font size"
              />

              {/* Font Size Preview */}
              <FontSizePreview fontSize={fontSize[0] || 14} />

              <div className="text-description text-muted-foreground">
                Adjust the font size for chat messages
              </div>
            </div>

            {/* Message Spacing Radio Group */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Message Spacing</Label>
              <RadioGroup
                value={messageSpacing}
                onValueChange={(value) =>
                  setMessageSpacing(value as "compact" | "normal" | "relaxed")
                }
                className="flex flex-row space-x-6"
                aria-describedby="spacing-description"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="spacing-compact" />
                  <Label
                    htmlFor="spacing-compact"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Compact
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="spacing-normal" />
                  <Label
                    htmlFor="spacing-normal"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Normal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="relaxed" id="spacing-relaxed" />
                  <Label
                    htmlFor="spacing-relaxed"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Relaxed
                  </Label>
                </div>
              </RadioGroup>
              <div
                id="spacing-description"
                className="text-description text-muted-foreground"
              >
                Control the spacing between chat messages
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalitiesSettings: React.FC = () => {
  return <PersonalitiesSection />;
};

// Helper components removed - using direct div elements for better accessibility control

const AdvancedSettings: React.FC = () => {
  // Developer Options state management
  const [debugMode, setDebugMode] = useState(false);
  const [experimentalFeatures, setExperimentalFeatures] = useState(false);

  // Loading states for accessibility announcements
  const [isExporting] = useState(false);
  const [isImporting] = useState(false);
  const [isClearing] = useState(false);

  // Success/error states for user feedback
  const [exportSuccess] = useState(false);
  const [importError] = useState("");

  // File input ref for Import button accessibility
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handler functions for Data Management buttons
  const handleExportSettings = useCallback(() => {
    console.log("Export Settings clicked - functionality to be implemented");
    // TODO: Implement settings export functionality
  }, []);

  const handleImportSettings = useCallback(() => {
    console.log("Import Settings clicked - functionality to be implemented");
    fileInputRef.current?.click();
    // TODO: Implement settings import functionality
  }, []);

  const handleClearConversations = useCallback(() => {
    console.log(
      "Clear All Conversations clicked - functionality to be implemented",
    );
    // TODO: Implement conversation clearing functionality
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-primary mb-[20px]">Advanced Settings</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Advanced configuration options for power users.
        </p>
      </div>

      {/* Live regions for screen reader announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {isExporting && "Exporting settings..."}
        {isImporting && "Importing settings..."}
        {isClearing && "Clearing conversations..."}
      </div>

      <div role="alert" aria-live="assertive" className="sr-only">
        {exportSuccess && "Settings exported successfully"}
        {importError && `Import failed: ${importError}`}
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-heading-secondary mb-4">Data Management</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-[12px]">
              {/* Export Settings Button */}
              <div className="flex flex-col">
                <Button
                  variant="secondary"
                  size="default"
                  onClick={handleExportSettings}
                  className="h-10 justify-start gap-2 min-h-[44px]"
                  aria-label="Export all application settings as JSON file"
                  aria-describedby="export-help-text"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Export All Settings
                </Button>
                <div
                  id="export-help-text"
                  className="text-description text-muted-foreground mt-2"
                >
                  Downloads a JSON file containing all your application settings
                </div>
              </div>

              {/* Import Settings Button with hidden file input */}
              <div className="flex flex-col">
                <Button
                  variant="secondary"
                  size="default"
                  onClick={handleImportSettings}
                  className="h-10 justify-start gap-2 min-h-[44px]"
                  aria-label="Import settings from JSON file"
                  aria-describedby="import-help-text import-warning"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  Import Settings
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="sr-only"
                  aria-label="Select JSON settings file to import"
                  onChange={(e) => {
                    // TODO: Handle file selection
                    console.log("File selected:", e.target.files?.[0]);
                  }}
                />
                <div
                  id="import-help-text"
                  className="text-description text-muted-foreground mt-2"
                >
                  Import settings from a JSON file
                </div>
                <div id="import-warning" className="sr-only">
                  Importing settings will replace your current configuration
                </div>
              </div>

              {/* Clear All Conversations Button with enhanced warnings */}
              <div className="flex flex-col">
                <Button
                  variant="destructive"
                  size="default"
                  onClick={handleClearConversations}
                  className="h-10 justify-start gap-2 min-h-[44px]"
                  aria-label="Clear all conversations permanently"
                  aria-describedby="clear-warning"
                  aria-expanded="false"
                  aria-haspopup="dialog"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Clear All Conversations
                </Button>
                <div
                  id="clear-warning"
                  role="alert"
                  className="text-description text-destructive mt-2"
                >
                  This cannot be undone
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-heading-secondary mb-4">Developer Options</h2>
          <div className="grid gap-6">
            {/* Debug Mode Toggle with enhanced accessibility */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="debug-mode" className="text-base">
                  Enable debug logging
                </Label>
                <div
                  id="debug-help"
                  className="text-description text-muted-foreground"
                >
                  Show detailed logs in developer console
                </div>
              </div>
              <Switch
                id="debug-mode"
                checked={debugMode}
                onCheckedChange={setDebugMode}
                aria-describedby="debug-help"
                aria-label="Toggle debug logging on or off"
              />
            </div>

            {/* Experimental Features Toggle with warning context */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="experimental-features" className="text-base">
                  Enable experimental features
                </Label>
                <div
                  id="experimental-help"
                  className="text-description text-muted-foreground"
                >
                  Access features currently in development
                </div>
                <div
                  id="experimental-warning"
                  role="alert"
                  className="text-description text-amber-600 dark:text-amber-400 flex items-center gap-1"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  May cause instability
                </div>
              </div>
              <Switch
                id="experimental-features"
                checked={experimentalFeatures}
                onCheckedChange={setExperimentalFeatures}
                aria-describedby="experimental-help experimental-warning"
                aria-label="Toggle experimental features with instability risk"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  agents: AgentsSection,
  personalities: PersonalitiesSettings,
  roles: RolesSection,
  advanced: AdvancedSettings,
} as const;

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
        "lg:p-[var(--dt-content-padding-desktop)]",
        "max-lg:p-[var(--dt-content-padding-mobile)]",
        // Full width when navigation is hidden/collapsed
        "max-md:w-full",
        // Takes remaining width when navigation is visible
        "md:flex-1",
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

      {/* Content container with region role */}
      <div
        className="max-w-[var(--dt-content-max-width)] mx-auto px-4 sm:px-6"
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
