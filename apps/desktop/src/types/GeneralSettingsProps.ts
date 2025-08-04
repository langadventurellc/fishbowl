import type { UseFormReturn } from "react-hook-form";
import type { GeneralSettingsFormData } from "@fishbowl-ai/ui-shared";

/**
 * Props for the GeneralSettings component.
 *
 * Receives form instance from parent component to enable
 * centralized form management and unified settings saving.
 */
export interface GeneralSettingsProps {
  /** Form instance managed by parent component */
  form: UseFormReturn<GeneralSettingsFormData>;

  /** Loading state from parent's settings persistence */
  isLoading?: boolean;

  /** Error state from parent's settings persistence */
  error?: Error | null;
}
