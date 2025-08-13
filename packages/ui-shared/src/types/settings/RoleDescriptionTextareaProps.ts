/**
 * RoleDescriptionTextarea component props interface.
 *
 * Defines the properties for the RoleDescriptionTextarea component which provides
 * a textarea with character counter for role descriptions.
 *
 * @module types/ui/components/RoleDescriptionTextareaProps
 */

export interface RoleDescriptionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number; // Default 200
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
  isDirty?: boolean; // Visual indicator for unsaved changes
}
