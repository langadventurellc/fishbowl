import { RolesErrorState } from "src/stores/RolesErrorState";
import { RoleViewModel, RolesPersistenceAdapter } from "src/types";
import { PendingOperation } from "src/types/roles/PendingOperation";

export interface RolesState {
  roles: RoleViewModel[];
  isLoading: boolean;
  error: RolesErrorState | null;
  // New adapter integration state
  adapter: RolesPersistenceAdapter | null;
  isInitialized: boolean;
  isSaving: boolean;
  lastSyncTime: string | null;
  pendingOperations: PendingOperation[];
  retryTimers: Map<string, ReturnType<typeof setTimeout>>;
}
