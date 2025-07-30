/**
 * CustomInstructionsTextarea component props interface.
 *
 * Defines the properties for the CustomInstructionsTextarea component which provides
 * a textarea with character counter for custom instructions.
 *
 * @module types/ui/components/CustomInstructionsTextareaProps
 */

export interface CustomInstructionsTextareaProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
}
