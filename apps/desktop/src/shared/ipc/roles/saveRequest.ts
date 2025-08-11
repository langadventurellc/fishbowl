import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";

/**
 * Roles save operation request type
 *
 * Contains the complete roles data to persist
 */
export interface RolesSaveRequest {
  roles: PersistedRolesSettingsData;
}
