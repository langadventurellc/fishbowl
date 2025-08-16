import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";
import {
  PersonalityFormData,
  PersonalityViewModel,
  PersonalitiesPersistenceAdapter,
} from "../types";
import { ErrorState } from "./ErrorState";

export interface PersonalitiesActions {
  createPersonality: (personalityData: PersonalityFormData) => string;
  updatePersonality: (id: string, personalityData: PersonalityFormData) => void;
  deletePersonality: (id: string) => void;
  getPersonalityById: (id: string) => PersonalityViewModel | undefined;
  isPersonalityNameUnique: (name: string, excludeId?: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  // Adapter integration methods
  setAdapter: (adapter: PersonalitiesPersistenceAdapter) => void;
  initialize: (adapter: PersonalitiesPersistenceAdapter) => Promise<void>;
  // Auto-save methods
  persistChanges: () => Promise<void>;
  syncWithStorage: () => Promise<void>;
  // Sync and bulk operation methods
  exportPersonalities: () => Promise<PersistedPersonalitiesSettingsData>;
  importPersonalities: (
    data: PersistedPersonalitiesSettingsData,
  ) => Promise<void>;
  resetPersonalities: () => Promise<void>;
  // Error recovery methods
  retryLastOperation: () => Promise<void>;
  clearErrorState: () => void;
  getErrorDetails: () => ErrorState;
}
