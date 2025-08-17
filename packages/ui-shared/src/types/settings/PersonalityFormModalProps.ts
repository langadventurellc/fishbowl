/**
 * PersonalityFormModal component props interface.
 *
 * @module components/settings/types/PersonalityFormModalProps
 */

import { PersonalityViewModel } from "./PersonalityViewModel";
import { PersonalityFormData } from "./PersonalityFormData";

export interface PersonalityFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  personality?: PersonalityViewModel;
  onSave: (data: PersonalityFormData) => void;
  isLoading?: boolean;
}
