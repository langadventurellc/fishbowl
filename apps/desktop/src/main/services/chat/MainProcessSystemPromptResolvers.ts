import { createLoggerSync } from "@fishbowl-ai/shared";
import type {
  PersistedPersonalityData,
  PersistedRoleData,
  SystemPromptResolvers,
} from "@fishbowl-ai/shared";

import { personalitiesRepositoryManager } from "../../../data/repositories/personalitiesRepositoryManager";
import { rolesRepositoryManager } from "../../../data/repositories/rolesRepositoryManager";

/**
 * Main process implementation of SystemPromptResolvers.
 * Uses repository managers to resolve roles and personalities by ID.
 */
export class MainProcessSystemPromptResolvers implements SystemPromptResolvers {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "MainProcessSystemPromptResolvers" } },
  });

  constructor() {
    this.logger.debug("MainProcessSystemPromptResolvers initialized");
  }

  /**
   * Resolve a role by its ID from the roles repository.
   *
   * @param roleId - The ID of the role to resolve
   * @returns Promise resolving to the role data
   * @throws Error if role not found or repository access fails
   */
  async resolveRole(roleId: string): Promise<PersistedRoleData> {
    this.logger.debug("Resolving role", { roleId });

    try {
      // Get the roles repository instance
      const rolesRepository = rolesRepositoryManager.get();

      // Load all roles from storage
      const rolesData = await rolesRepository.loadRoles();

      // Find the specific role by ID
      const role = rolesData.roles?.find(
        (r: PersistedRoleData) => r.id === roleId,
      );

      if (!role) {
        throw new Error(`Role not found: ${roleId}`);
      }

      this.logger.debug("Role resolved successfully", {
        roleId,
        roleName: role.name,
      });

      return role;
    } catch (error) {
      this.logger.error("Failed to resolve role", error as Error, { roleId });
      throw error;
    }
  }

  /**
   * Resolve a personality by its ID from the personalities repository.
   *
   * @param personalityId - The ID of the personality to resolve
   * @returns Promise resolving to the personality data
   * @throws Error if personality not found or repository access fails
   */
  async resolvePersonality(
    personalityId: string,
  ): Promise<PersistedPersonalityData> {
    this.logger.debug("Resolving personality", { personalityId });

    try {
      // Get the personalities repository instance
      const personalitiesRepository = personalitiesRepositoryManager.get();

      // Load all personalities from storage
      const personalitiesData =
        await personalitiesRepository.loadPersonalities();

      // Find the specific personality by ID
      const personality = personalitiesData.personalities?.find(
        (p: PersistedPersonalityData) => p.id === personalityId,
      );

      if (!personality) {
        throw new Error(`Personality not found: ${personalityId}`);
      }

      this.logger.debug("Personality resolved successfully", {
        personalityId,
        personalityName: personality.name,
      });

      return personality;
    } catch (error) {
      this.logger.error("Failed to resolve personality", error as Error, {
        personalityId,
      });
      throw error;
    }
  }
}
