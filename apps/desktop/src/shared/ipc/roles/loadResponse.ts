import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Roles load operation response type
 *
 * Returns the complete roles configuration from persistent storage
 */
export interface RolesLoadResponse
  extends IPCResponse<PersistedRolesSettingsData> {}
