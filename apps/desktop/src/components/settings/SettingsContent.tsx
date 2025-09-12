/**
 * SettingsContent component provides responsive content area for settings modal.
 */

import { getAccessibleDescription } from "@/utils";
import {
  type SettingsContentProps,
  useSettingsActions,
  useSettingsPersistence,
} from "@fishbowl-ai/ui-shared";
import { useCallback, useEffect } from "react";
import { useSettingsPersistenceAdapter } from "../../contexts";
import { cn } from "../../lib/utils";
import { AdvancedSettings } from "./AdvancedSettings";
import { AgentsSection } from "./agents/AgentsSection";
import { AppearanceSettings } from "./AppearanceSettings";
import { DefaultSettings } from "./DefaultSettings";
import { GeneralSettings } from "./GeneralSettings";
import {
  useFormInitialization,
  useSettingsForms,
  useSettingsFormValidation,
} from "./hooks";
import { LlmSetupSection } from "./llm-setup";
import { PersonalitiesSection } from "./personalities";
import { RolesSection } from "./roles/RolesSection";

const sectionComponents = {
  "llm-setup": LlmSetupSection,
  agents: AgentsSection,
  personalities: PersonalitiesSection,
  roles: RolesSection,
} as const;

export function SettingsContent({
  activeSection,
  className,
  contentId = "settings-content",
}: SettingsContentProps) {
  // Get persistence adapter
  const adapter = useSettingsPersistenceAdapter();

  // Get settings actions for state management
  const { setUnsavedChanges } = useSettingsActions();

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

  // Initialize forms using custom hook
  const { generalForm, appearanceForm, advancedForm, formsAreDirty } =
    useSettingsForms({ settings });

  // Initialize form validation and save logic
  const { handleUnifiedSave } = useSettingsFormValidation({
    generalForm,
    appearanceForm,
    advancedForm,
    settings,
    saveSettings: _saveSettings,
  });

  // Initialize form reset logic to prevent infinite loops
  useFormInitialization({
    activeSection,
    settings,
    generalForm,
    appearanceForm,
    advancedForm,
  });

  // Update unsaved changes state when forms become dirty or clean
  useEffect(() => {
    setUnsavedChanges(formsAreDirty);
  }, [formsAreDirty, setUnsavedChanges]);

  // Add event listener for settings-save event from ModalFooter
  useEffect(() => {
    const handleSettingsSave = () => {
      handleUnifiedSave();
    };

    window.addEventListener("settings-save", handleSettingsSave);
    return () => {
      window.removeEventListener("settings-save", handleSettingsSave);
    };
  }, [handleUnifiedSave]);

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

    if (activeSection === "advanced") {
      return (
        <AdvancedSettings
          form={advancedForm}
          isLoading={isLoading}
          error={error}
        />
      );
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
        "flex-1 overflow-y-scroll max-md:w-full md:flex-1 bg-background py-[16px]",
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
