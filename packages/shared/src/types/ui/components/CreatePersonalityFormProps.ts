/**
 * Props for create personality form component
 *
 * @module types/ui/components/CreatePersonalityFormProps
 */

import type { PersonalityFormData } from "../settings";

export interface CreatePersonalityFormProps {
  onSave: (data: PersonalityFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PersonalityFormData>;
}
