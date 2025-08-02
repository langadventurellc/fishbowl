import type { PersistedSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "./base";

/**
 * Settings reset operation response type
 */
export interface SettingsResetResponse
  extends IPCResponse<PersistedSettingsData> {}
