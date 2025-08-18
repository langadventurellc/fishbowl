/**
 * Custom hook for managing settings forms
 */

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
  type SettingsFormData,
} from "@fishbowl-ai/ui-shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface UseSettingsFormsProps {
  settings?: SettingsFormData | null;
}

export function useSettingsForms({ settings }: UseSettingsFormsProps) {
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

  // Track form dirty state to update unsaved changes
  const formsAreDirty =
    generalForm.formState.isDirty ||
    appearanceForm.formState.isDirty ||
    advancedForm.formState.isDirty;

  return {
    generalForm,
    appearanceForm,
    advancedForm,
    formsAreDirty,
  };
}
