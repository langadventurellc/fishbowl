import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Roles reset operation response type
 *
 * Returns the default/empty roles configuration after reset
 */
export interface RolesResetResponse
  extends IPCResponse<PersistedRolesSettingsData> {}
