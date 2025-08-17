import {
  PersonalityViewModel,
  PersonalitiesPersistenceAdapter,
} from "../types";
import { PendingOperation } from "../types/personalities/PendingOperation";
import { ErrorState } from "./ErrorState";

export interface PersonalitiesState {
  personalities: PersonalityViewModel[];
  isLoading: boolean;
  error: ErrorState | null;
  // New adapter integration state
  adapter: PersonalitiesPersistenceAdapter | null;
  isInitialized: boolean;
  isSaving: boolean;
  lastSyncTime: string | null;
  pendingOperations: PendingOperation[];
  retryTimers: Map<string, ReturnType<typeof setTimeout>>;
}
