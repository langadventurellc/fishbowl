import { RoleViewModel, RolesPersistenceAdapter } from "../types";
import { PendingOperation } from "../types/roles/PendingOperation";
import { RolesErrorState } from "./RolesErrorState";

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
