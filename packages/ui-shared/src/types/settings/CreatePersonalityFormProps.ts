/**
 * Props for create personality form component
 *
 * @module types/ui/components/CreatePersonalityFormProps
 */

import { PersonalityFormData } from "./PersonalityFormData";

export interface CreatePersonalityFormProps {
  onSave: (data: PersonalityFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PersonalityFormData>;
}
