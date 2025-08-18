import type { StructuredLogger } from "@fishbowl-ai/shared";
import { RoleViewModel, RolesPersistenceAdapter } from "../types";
import { PendingOperation } from "../types/roles/PendingOperation";
import { ErrorState } from "./ErrorState";

export interface RolesState {
  roles: RoleViewModel[];
  isLoading: boolean;
  error: ErrorState | null;
  // New adapter integration state
  adapter: RolesPersistenceAdapter | null;
  logger: StructuredLogger;
  isInitialized: boolean;
  isSaving: boolean;
  lastSyncTime: string | null;
  pendingOperations: PendingOperation[];
  retryTimers: Map<string, ReturnType<typeof setTimeout>>;
}
