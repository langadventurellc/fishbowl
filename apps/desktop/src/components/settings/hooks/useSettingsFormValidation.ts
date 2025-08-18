/**
 * Custom hook for managing settings form validation and saving
 */

import {
  type AdvancedSettingsFormData,
  type AppearanceSettingsFormData,
  type GeneralSettingsFormData,
  type SettingsFormData,
  useSettingsActions,
} from "@fishbowl-ai/ui-shared";
import { useCallback } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useServices } from "../../../contexts";

interface UseSettingsFormValidationProps {
  generalForm: UseFormReturn<GeneralSettingsFormData>;
  appearanceForm: UseFormReturn<AppearanceSettingsFormData>;
  advancedForm: UseFormReturn<AdvancedSettingsFormData>;
  settings?: SettingsFormData | null;
  saveSettings: (settings: SettingsFormData) => Promise<void>;
}

export function useSettingsFormValidation({
  generalForm,
  appearanceForm,
  advancedForm,
  settings,
  saveSettings,
}: UseSettingsFormValidationProps) {
  const { logger } = useServices();
  const { setUnsavedChanges } = useSettingsActions();

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
    [generalForm, appearanceForm, advancedForm, logger],
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
    await saveSettings(updatedSettings);

    return { generalData, appearanceData, advancedData };
  }, [generalForm, appearanceForm, advancedForm, settings, saveSettings]);

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

  // Unified save handler that validates and saves all forms atomically
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
    logger,
  ]);

  return {
    handleUnifiedSave,
  };
}
