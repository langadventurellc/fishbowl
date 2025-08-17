/**
 * PersonalityDeleteDialog component props interface.
 *
 * @module types/ui/components/PersonalityDeleteDialogProps
 */

import type { PersonalityViewModel } from "./PersonalityViewModel";

export interface PersonalityDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personality: PersonalityViewModel | null;
  onConfirm: (personality: PersonalityViewModel) => void;
  isLoading?: boolean;
}
