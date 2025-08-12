/**
 * RoleSystemPromptTextarea component props interface.
 *
 * Defines the properties for the RoleSystemPromptTextarea component which provides
 * a large textarea with character counter for role system prompts.
 *
 * @module types/ui/components/RoleSystemPromptTextareaProps
 */

export interface RoleSystemPromptTextareaProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number; // Default 5000
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
}
