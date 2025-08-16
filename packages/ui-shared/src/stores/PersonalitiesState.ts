import {
  PersonalityViewModel,
  PersonalitiesPersistenceAdapter,
} from "../types";
import { PendingOperation } from "../types/personalities/PendingOperation";
import { PersonalitiesErrorState } from "./PersonalitiesErrorState";

export interface PersonalitiesState {
  personalities: PersonalityViewModel[];
  isLoading: boolean;
  error: PersonalitiesErrorState | null;
  // New adapter integration state
  adapter: PersonalitiesPersistenceAdapter | null;
  isInitialized: boolean;
  isSaving: boolean;
  lastSyncTime: string | null;
  pendingOperations: PendingOperation[];
  retryTimers: Map<string, ReturnType<typeof setTimeout>>;
}
