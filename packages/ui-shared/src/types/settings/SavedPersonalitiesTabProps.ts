/**
 * Props for saved personalities tab component
 *
 * @module types/ui/components/SavedPersonalitiesTabProps
 */

import { PersonalityViewModel } from "./PersonalityViewModel";

export interface SavedPersonalitiesTabProps {
  onEdit: (personality: PersonalityViewModel) => void;
  onDelete: (personality: PersonalityViewModel) => void;
}
