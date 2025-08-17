import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Personalities load operation response type
 *
 * Returns the loaded personalities data
 */
export interface PersonalitiesLoadResponse
  extends IPCResponse<PersistedPersonalitiesSettingsData> {}
