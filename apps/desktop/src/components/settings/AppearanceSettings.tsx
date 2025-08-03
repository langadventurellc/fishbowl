import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Form } from "@/components/ui/form";
import {
  type FontSizePreviewProps,
  type ThemePreviewProps,
  defaultAppearanceSettings,
  appearanceSettingsSchema,
  useSettingsPersistence,
  useUnsavedChanges,
  type AppearanceSettingsFormData,
} from "@fishbowl-ai/ui-shared";
import { useSettingsPersistenceAdapter } from "../../contexts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { applyTheme } from "@/utils";
import { FormErrorDisplay } from "./FormErrorDisplay";
import React, { useCallback, useEffect, useRef, useState } from "react";

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

export const AppearanceSettings: React.FC = () => {
  // Keep existing state for now (will be removed in subsequent tasks)
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

  // Add persistence hooks
  const { setUnsavedChanges: _setUnsavedChanges } = useUnsavedChanges();
  const adapter = useSettingsPersistenceAdapter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onError = useCallback((error: Error) => {
    setSubmitError(error.message);
  }, []);

  const {
    settings,
    saveSettings: _saveSettings,
    isLoading,
    error,
  } = useSettingsPersistence({
    adapter,
    onError,
  });

  // Initialize form
  const form = useForm<AppearanceSettingsFormData>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: settings?.appearance || defaultAppearanceSettings,
    mode: "onChange",
  });

  // Apply theme changes immediately (existing functionality)
  useEffect(() => {
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  // Optimized event handlers with useCallback
  const handleThemeChange = useCallback((value: string) => {
    setSelectedTheme(value as "light" | "dark" | "system");
  }, []);

  const handleFontSizeChange = useCallback((value: number[]) => {
    setFontSize(value);
  }, []);

  // Add loading state
  if (isLoading) {
    return <div>Loading appearance settings...</div>;
  }

  return (
    <Form {...form}>
      <form className="space-y-6">
        {error && <FormErrorDisplay error={error.message} />}
        {submitError && <FormErrorDisplay error={submitError} />}
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
                      <Label className="text-base">
                        Show last activity time
                      </Label>
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
                      <Label className="text-base">
                        Compact conversation list
                      </Label>
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
                    <Label className="text-sm font-medium">
                      Message Font Size
                    </Label>
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
                      setMessageSpacing(
                        value as "compact" | "normal" | "relaxed",
                      )
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
      </form>
    </Form>
  );
};
