import { RolesErrorState } from "src/stores/RolesErrorState";
import { RoleViewModel, RolesPersistenceAdapter } from "src/types";

export interface RolesState {
  roles: RoleViewModel[];
  isLoading: boolean;
  error: RolesErrorState | null;
  // New adapter integration state
  adapter: RolesPersistenceAdapter | null;
  isInitialized: boolean;
  isSaving: boolean;
  lastSyncTime: string | null;
  pendingOperations: Array<{ type: string; timestamp: string }>;
  retryTimers: Map<string, ReturnType<typeof setTimeout>>;
}
