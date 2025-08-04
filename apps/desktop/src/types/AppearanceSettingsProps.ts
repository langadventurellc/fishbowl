import { UseFormReturn } from "react-hook-form";
import type { AppearanceSettingsFormData } from "@fishbowl-ai/ui-shared";

export interface AppearanceSettingsProps {
  form: UseFormReturn<AppearanceSettingsFormData>;
}
