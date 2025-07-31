/**
 * Props for saved personalities tab component
 *
 * @module types/ui/components/SavedPersonalitiesTabProps
 */

import { Personality } from "./Personality";

export interface SavedPersonalitiesTabProps {
  onEdit: (personality: Personality) => void;
  onClone: (personality: Personality) => void;
}
