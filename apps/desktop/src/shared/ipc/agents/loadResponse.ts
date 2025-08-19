import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Agents load operation response type
 *
 * Returns the loaded agents data
 */
export interface AgentsLoadResponse
  extends IPCResponse<PersistedAgentsSettingsData> {}
