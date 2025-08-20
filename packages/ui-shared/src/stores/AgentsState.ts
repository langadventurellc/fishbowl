import type { StructuredLogger } from "@fishbowl-ai/shared";
import {
  AgentDefaults,
  AgentSettingsViewModel,
  AgentsPersistenceAdapter,
} from "../types";
import { PendingOperation } from "../types/agents/PendingOperation";
import { ErrorState } from "./ErrorState";

export interface AgentsState {
  agents: AgentSettingsViewModel[];
  defaults: AgentDefaults;
  isLoading: boolean;
  error: ErrorState | null;
  // New adapter integration state
  adapter: AgentsPersistenceAdapter | null;
  logger: StructuredLogger;
  isInitialized: boolean;
  isSaving: boolean;
  lastSyncTime: string | null;
  pendingOperations: PendingOperation[];
  retryTimers: Map<string, ReturnType<typeof setTimeout>>;
}
