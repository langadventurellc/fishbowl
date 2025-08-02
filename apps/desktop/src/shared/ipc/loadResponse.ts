import type { PersistedSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "./base";

/**
 * Settings load operation response type
 */
export interface SettingsLoadResponse
  extends IPCResponse<PersistedSettingsData> {}
