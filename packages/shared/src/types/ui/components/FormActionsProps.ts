/**
 * Props interface for FormActions component
 * @module types/ui/components/FormActionsProps
 */

export interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  isEditMode: boolean;
}
