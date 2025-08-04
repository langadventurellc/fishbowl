/**
 * SettingsContent component provides responsive content area for settings modal.
 */

import { getAccessibleDescription } from "@/utils";
import { createLoggerSync } from "@fishbowl-ai/shared";
import {
  type AdvancedSettingsFormData,
  advancedSettingsSchema,
  type AppearanceSettingsFormData,
  appearanceSettingsSchema,
  defaultAdvancedSettings,
  defaultAppearanceSettings,
  defaultGeneralSettings,
  type GeneralSettingsFormData,
  generalSettingsSchema,
  type SettingsContentProps,
  useSettingsActions,
  useSettingsPersistence,
} from "@fishbowl-ai/ui-shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
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

const logger = createLoggerSync({
  config: { name: "SettingsContent", level: "info" },
});

const sectionComponents = {
  "llm-setup": ApiKeysSettings,
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

  // Create form instance for AdvancedSettings
  const advancedForm = useForm<AdvancedSettingsFormData>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: settings?.advanced || defaultAdvancedSettings,
    mode: "onChange",
  });

  // Use ref to track if forms have been initialized to prevent infinite loops
  const hasInitializedForm = useRef(false);
  const hasInitializedAppearanceForm = useRef(false);
  const hasInitializedAdvancedForm = useRef(false);

  // Track form dirty state to update unsaved changes
  const formsAreDirty =
    generalForm.formState.isDirty ||
    appearanceForm.formState.isDirty ||
    advancedForm.formState.isDirty;

  // Update unsaved changes state when forms become dirty or clean
  useEffect(() => {
    setUnsavedChanges(formsAreDirty);
  }, [formsAreDirty, setUnsavedChanges]);

  // Unified save handler that validates and saves all forms atomically
  // Validates all forms and returns validation results
  const validateAllForms = useCallback(async () => {
    const [generalValid, appearanceValid, advancedValid] = await Promise.all([
      generalForm.trigger(),
      appearanceForm.trigger(),
      advancedForm.trigger(),
    ]);

    return {
      generalValid,
      appearanceValid,
      advancedValid,
      allValid: generalValid && appearanceValid && advancedValid,
    };
  }, [generalForm, appearanceForm, advancedForm]);
  // Handles validation errors by focusing on the first error field
  const handleValidationErrors = useCallback(
    (validationResults: {
      generalValid: boolean;
      appearanceValid: boolean;
      advancedValid: boolean;
    }) => {
      const { generalValid, appearanceValid, advancedValid } =
        validationResults;

      // Find first form with errors and focus first error field
      if (!generalValid && generalForm.formState.errors) {
        const firstErrorField = Object.keys(generalForm.formState.errors)[0];
        if (firstErrorField) {
          generalForm.setFocus(
            firstErrorField as keyof GeneralSettingsFormData,
          );
        }
      } else if (!appearanceValid && appearanceForm.formState.errors) {
        const firstErrorField = Object.keys(appearanceForm.formState.errors)[0];
        if (firstErrorField) {
          appearanceForm.setFocus(
            firstErrorField as keyof AppearanceSettingsFormData,
          );
        }
      } else if (!advancedValid && advancedForm.formState.errors) {
        const firstErrorField = Object.keys(advancedForm.formState.errors)[0];
        if (firstErrorField) {
          advancedForm.setFocus(
            firstErrorField as keyof AdvancedSettingsFormData,
          );
        }
      }

      logger.warn("Validation failed for forms", {
        generalValid,
        appearanceValid,
        advancedValid,
        generalErrors: generalForm.formState.errors,
        appearanceErrors: appearanceForm.formState.errors,
        advancedErrors: advancedForm.formState.errors,
      });
    },
    [generalForm, appearanceForm, advancedForm],
  );
  // Collects form data and saves settings
  const saveValidatedSettings = useCallback(async () => {
    // Get validated data from forms
    const generalData = generalForm.getValues();
    const appearanceData = appearanceForm.getValues();
    const advancedData = advancedForm.getValues();

    // Update existing settings with form data
    const updatedSettings = {
      ...settings,
      general: generalData,
      appearance: appearanceData,
      advanced: advancedData,
    };

    // Save the updated settings atomically
    await _saveSettings(updatedSettings);

    return { generalData, appearanceData, advancedData };
  }, [generalForm, appearanceForm, advancedForm, settings, _saveSettings]);

  // Resets all forms to pristine state after successful save
  const resetFormsAfterSave = useCallback(
    (data: {
      generalData: GeneralSettingsFormData;
      appearanceData: AppearanceSettingsFormData;
      advancedData: AdvancedSettingsFormData;
    }) => {
      const { generalData, appearanceData, advancedData } = data;

      // Reset form states to mark as pristine after successful save
      generalForm.reset(generalData);
      appearanceForm.reset(appearanceData);
      advancedForm.reset(advancedData);

      // Reset unsaved changes state to disable save button
      setUnsavedChanges(false);
    },
    [generalForm, appearanceForm, advancedForm, setUnsavedChanges],
  );
  const handleUnifiedSave = useCallback(async (): Promise<void> => {
    if (!settings) {
      logger.warn("No settings available for saving");
      return;
    }

    try {
      // Validate all forms
      const validationResults = await validateAllForms();

      // If validation fails, handle errors and return early
      if (!validationResults.allValid) {
        handleValidationErrors(validationResults);
        return;
      }

      // Save the validated settings and get the data
      const savedData = await saveValidatedSettings();

      // Reset forms to pristine state after successful save
      resetFormsAfterSave(savedData);

      logger.info("Settings saved successfully via unified handler");
    } catch (error) {
      logger.error(
        "Failed to save settings via unified handler",
        error as Error,
      );
    }
  }, [
    settings,
    validateAllForms,
    handleValidationErrors,
    saveValidatedSettings,
    resetFormsAfterSave,
  ]);

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
  }, [activeSection, settings?.general]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [activeSection, settings?.appearance]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset advanced form when settings are loaded, but only for advanced section
  useEffect(() => {
    if (
      activeSection === "advanced" &&
      settings?.advanced &&
      !hasInitializedAdvancedForm.current
    ) {
      advancedForm.reset(settings.advanced);
      hasInitializedAdvancedForm.current = true;
    }

    // Reset the flag when switching away from advanced section
    if (activeSection !== "advanced") {
      hasInitializedAdvancedForm.current = false;
    }
  }, [activeSection, settings?.advanced]); // eslint-disable-line react-hooks/exhaustive-deps

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
