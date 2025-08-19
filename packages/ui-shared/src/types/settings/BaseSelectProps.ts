/**
 * Base interface for all selection components in the agent management system.
 * This ensures consistent prop structure across ModelSelect, RoleSelect, and PersonalitySelect.
 */
export interface BaseSelectProps {
  /** Currently selected value */
  value: string;
  /** Callback fired when selection changes */
  onChange: (value: string) => void;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Placeholder text when no value is selected */
  placeholder?: string;
}
