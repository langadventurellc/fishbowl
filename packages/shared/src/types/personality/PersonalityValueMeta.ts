/**
 * Metadata for a specific discrete value of a personality trait.
 * Contains the short description shown in UI and the prompt used for AI behavior.
 */
export interface PersonalityValueMeta {
  /** Short description displayed in the UI (e.g., "Curious and open to new ideas") */
  short: string;
  /** Full prompt text used to configure AI behavior */
  prompt?: string;
  /** Optional numeric value for AI response settings traits */
  value?: number;
}
