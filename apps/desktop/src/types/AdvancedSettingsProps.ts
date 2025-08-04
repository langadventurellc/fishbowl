import type { UseFormReturn } from "react-hook-form";
import type { AdvancedSettingsFormData } from "@fishbowl-ai/ui-shared";

/**
 * Props for the AdvancedSettings component.
 *
 * Receives form instance from parent component to enable
 * centralized form management and unified settings saving.
 */
export interface AdvancedSettingsProps {
  /** Form instance managed by parent component */
  form: UseFormReturn<AdvancedSettingsFormData>;

  /** Loading state from parent's settings persistence */
  isLoading?: boolean;

  /** Error state from parent's settings persistence */
  error?: Error | null;
}
