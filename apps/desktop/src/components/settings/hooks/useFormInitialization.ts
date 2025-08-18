/**
 * Custom hook for managing form initialization to prevent infinite loops
 */

import {
  type AdvancedSettingsFormData,
  type AppearanceSettingsFormData,
  type GeneralSettingsFormData,
  type SettingsFormData,
} from "@fishbowl-ai/ui-shared";
import { useEffect, useRef } from "react";
import { type UseFormReturn } from "react-hook-form";

interface UseFormInitializationProps {
  activeSection: string;
  settings?: SettingsFormData | null;
  generalForm: UseFormReturn<GeneralSettingsFormData>;
  appearanceForm: UseFormReturn<AppearanceSettingsFormData>;
  advancedForm: UseFormReturn<AdvancedSettingsFormData>;
}

export function useFormInitialization({
  activeSection,
  settings,
  generalForm,
  appearanceForm,
  advancedForm,
}: UseFormInitializationProps) {
  // Use ref to track if forms have been initialized to prevent infinite loops
  const hasInitializedForm = useRef(false);
  const hasInitializedAppearanceForm = useRef(false);
  const hasInitializedAdvancedForm = useRef(false);

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
  }, [activeSection, settings?.general, generalForm]);

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
  }, [activeSection, settings?.appearance, appearanceForm]);

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
  }, [activeSection, settings?.advanced, advancedForm]);
}
