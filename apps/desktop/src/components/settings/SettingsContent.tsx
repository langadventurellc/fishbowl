/**
 * SettingsContent component provides responsive content area for settings modal.
 *
 * Features:
 * - Responsive padding that adjusts based on screen size
 * - Full width on mobile when navigation is collapsed
 * - Maximum content width constraint for readability
 * - Centralized form management and settings persistence
 * - Loading and error state management for all settings sections
 */

import React, { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAccessibleDescription } from "@/utils";
import {
  type SettingsContentProps,
  useSettingsPersistence,
  type GeneralSettingsFormData,
  generalSettingsSchema,
  defaultGeneralSettings,
  type AppearanceSettingsFormData,
  appearanceSettingsSchema,
  defaultAppearanceSettings,
} from "@fishbowl-ai/ui-shared";
import { useSettingsPersistenceAdapter } from "../../contexts";
import { cn } from "../../lib/utils";
import { AdvancedSettings } from "./AdvancedSettings";
import { AgentsSection } from "./agents/AgentsSection";
import { ApiKeysSettings } from "./ApiKeysSettings";
import { AppearanceSettings } from "./AppearanceSettings";
import { DefaultSettings } from "./DefaultSettings";
import { GeneralSettings } from "./GeneralSettings";
import { PersonalitiesSection } from "./personalities";
import { RolesSection } from "./roles/RolesSection";

const sectionComponents = {
  "api-keys": ApiKeysSettings,
  agents: AgentsSection,
  personalities: PersonalitiesSection,
  roles: RolesSection,
  advanced: AdvancedSettings,
} as const;

export function SettingsContent({
  activeSection,
  className,
  contentId = "settings-content",
}: SettingsContentProps) {
  // Get persistence adapter
  const adapter = useSettingsPersistenceAdapter();

  // Error handler for persistence operations
  const onError = useCallback((error: Error) => {
    console.error("Settings persistence error:", error);
  }, []);

  // Initialize centralized settings persistence
  const {
    settings,
    saveSettings: _saveSettings,
    isLoading,
    error,
  } = useSettingsPersistence({
    adapter,
    onError,
  });

  // Create form instance for GeneralSettings
  const generalForm = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings?.general || defaultGeneralSettings,
    mode: "onChange",
  });

  // Create form instance for AppearanceSettings
  const appearanceForm = useForm<AppearanceSettingsFormData>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: settings?.appearance || defaultAppearanceSettings,
    mode: "onChange",
  });

  // Use ref to track if forms have been initialized to prevent infinite loops
  const hasInitializedForm = useRef(false);
  const hasInitializedAppearanceForm = useRef(false);

  // Reset form when settings are loaded, but only for general section
  useEffect(() => {
    if (
      activeSection === "general" &&
      settings?.general &&
      !hasInitializedForm.current
    ) {
      generalForm.reset(settings.general);
      hasInitializedForm.current = true;
    }

    // Reset the flag when switching away from general section
    if (activeSection !== "general") {
      hasInitializedForm.current = false;
    }
  }, [activeSection, settings?.general]); // Remove generalForm from dependencies

  // Reset appearance form when settings are loaded, but only for appearance section
  useEffect(() => {
    if (
      activeSection === "appearance" &&
      settings?.appearance &&
      !hasInitializedAppearanceForm.current
    ) {
      appearanceForm.reset(settings.appearance);
      hasInitializedAppearanceForm.current = true;
    }

    // Reset the flag when switching away from appearance section
    if (activeSection !== "appearance") {
      hasInitializedAppearanceForm.current = false;
    }
  }, [activeSection, settings?.appearance]); // Remove appearanceForm from dependencies

  // Get the component for the active section
  const getActiveComponent = () => {
    if (activeSection === "general") {
      return (
        <GeneralSettings
          form={generalForm}
          isLoading={isLoading}
          error={error}
        />
      );
    }

    if (activeSection === "appearance") {
      return <AppearanceSettings form={appearanceForm} />;
    }

    const Component =
      sectionComponents[activeSection as keyof typeof sectionComponents] ||
      DefaultSettings;
    return <Component />;
  };

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
          {getActiveComponent()}
        </div>
      </div>
    </main>
  );
}
