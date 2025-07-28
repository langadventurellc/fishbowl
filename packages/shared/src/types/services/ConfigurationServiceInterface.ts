/**
 * @fileoverview Configuration Service Interface
 *
 * Service interface for unified configuration management that coordinates
 * with PersonalityService, RoleService, and AgentService for cross-service
 * configuration operations.
 */

import type { Agent } from "../agent";
import type { PersonalityConfiguration } from "../personality";
import type { CustomRole } from "../role";
import type { UnifiedConfigurationRequest } from "./UnifiedConfigurationRequest";
import type { UnifiedConfigurationUpdateRequest } from "./UnifiedConfigurationUpdateRequest";

/**
 * Configuration Service Interface
 * Orchestrates cross-service configuration operations with transaction-like behavior
 */
export interface ConfigurationService {
  /**
   * Create complete agent configuration across all services
   * Ensures referential integrity between personality, role, and agent
   */
  createUnifiedConfiguration(config: UnifiedConfigurationRequest): Promise<{
    personality: PersonalityConfiguration;
    role: CustomRole;
    agent: Agent;
  }>;

  /**
   * Get complete configuration by agent ID
   * Retrieves coordinated data from all related services
   */
  getUnifiedConfiguration(agentId: string): Promise<{
    personality: PersonalityConfiguration;
    role: CustomRole;
    agent: Agent;
  } | null>;

  /**
   * Update unified configuration with cross-service coordination
   * Ensures all updates are applied consistently or rolled back
   */
  updateUnifiedConfiguration(
    agentId: string,
    updates: UnifiedConfigurationUpdateRequest,
  ): Promise<{
    personality: PersonalityConfiguration;
    role: CustomRole;
    agent: Agent;
  }>;

  /**
   * Delete unified configuration with dependency checking
   * Ensures safe deletion across all services
   */
  deleteUnifiedConfiguration(agentId: string): Promise<void>;

  /**
   * List all unified configurations with cross-service data
   */
  listUnifiedConfigurations(): Promise<
    Array<{
      personality: PersonalityConfiguration;
      role: CustomRole;
      agent: Agent;
    }>
  >;

  /**
   * Validate cross-service configuration consistency
   * Checks referential integrity and business rules
   */
  validateUnifiedConfiguration(config: UnifiedConfigurationRequest): Promise<{
    isValid: boolean;
    errors: Array<{
      service: string;
      field: string;
      message: string;
    }>;
  }>;
}
