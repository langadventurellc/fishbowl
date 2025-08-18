/**
 * Props interface for personality creation/editing form components
 *
 * Supports both create and edit modes with proper state management integration.
 * In create mode, no initialData is required. In edit mode, pass the full
 * PersonalityViewModel to pre-populate the form with existing values.
 *
 * @module types/ui/components/CreatePersonalityFormProps
 */

import type { PersonalityFormData } from "./PersonalityFormData";
import type { PersonalityViewModel } from "./PersonalityViewModel";

export interface CreatePersonalityFormProps {
  /** Form mode - determines behavior and validation */
  mode: "create" | "edit";
  /**
   * Initial data for form pre-population
   * - In create mode: typically undefined
   * - In edit mode: full PersonalityViewModel with id and timestamps
   */
  initialData?: PersonalityViewModel;
  /** Callback when form is saved with valid data */
  onSave: (data: PersonalityFormData) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /**
   * Existing personalities for validation (e.g., name uniqueness)
   * Excludes the current personality being edited
   */
  existingPersonalities?: PersonalityViewModel[];
  /**
   * Loading state indicator
   * @default false
   */
  isLoading?: boolean;
}
