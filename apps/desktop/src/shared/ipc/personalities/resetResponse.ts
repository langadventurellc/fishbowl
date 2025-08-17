import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Personalities reset operation response type
 *
 * Returns the reset personalities data
 */
export interface PersonalitiesResetResponse
  extends IPCResponse<PersistedPersonalitiesSettingsData> {}
