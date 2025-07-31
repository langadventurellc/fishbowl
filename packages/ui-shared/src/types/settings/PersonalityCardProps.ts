/**
 * Personality card component props
 *
 * @module types/ui/settings/PersonalityCardProps
 */
import type { Personality } from "./Personality";

export interface PersonalityCardProps {
  /** Personality data to display */
  personality: Personality;
  /** Callback when edit button is clicked */
  onEdit: (personality: Personality) => void;
  /** Callback when clone button is clicked */
  onClone: (personality: Personality) => void;
}
