/**
 * Personality card component props
 *
 * @module types/ui/settings/PersonalityCardProps
 */
import type { PersonalityViewModel } from "./PersonalityViewModel";

export interface PersonalityCardProps {
  /** Personality data to display */
  personality: PersonalityViewModel;
  /** Callback when edit button is clicked */
  onEdit: (personality: PersonalityViewModel) => void;
  /** Callback when delete button is clicked */
  onDelete: (personality: PersonalityViewModel) => void;
}
