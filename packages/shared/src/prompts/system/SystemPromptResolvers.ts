import type { PersistedPersonalityData } from "../../types/settings/PersistedPersonalityData";
import type { PersistedRoleData } from "../../types/settings/PersistedRoleData";

export interface SystemPromptResolvers {
  resolvePersonality(personalityId: string): Promise<PersistedPersonalityData>;
  resolveRole(roleId: string): Promise<PersistedRoleData>;
}
