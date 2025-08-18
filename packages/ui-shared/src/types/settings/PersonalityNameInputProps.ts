/**
 * PersonalityNameInput component props interface.
 *
 * Defines the properties for the PersonalityNameInput component which provides
 * personality name input with validation, uniqueness checking, and accessibility features.
 *
 * @module types/ui/components/PersonalityNameInputProps
 */

import type { Personality } from "./Personality";

export interface PersonalityNameInputProps {
  value: string;
  onChange: (value: string) => void;
  existingPersonalities?: Personality[];
  currentPersonalityId?: string;
  showCharacterCounter?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
}
