import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Agents reset operation response type
 *
 * Returns the reset agents data
 */
export interface AgentsResetResponse
  extends IPCResponse<PersistedAgentsSettingsData> {}
