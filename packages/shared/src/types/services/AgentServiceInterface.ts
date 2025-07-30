/**
 * @fileoverview Agent Service Interface
 *
 * Service interface for agent configuration creation workflows and management.
 * Coordinates with PersonalityService, RoleService, ModelService, and ValidationService.
 */

import type {
  Agent as ServiceAgent,
  AgentCreateRequest,
  AgentUpdateRequest,
} from "../agent";
import type { ValidationResult } from "../role";

/**
 * Agent Service Interface
 * Orchestrates agent configuration creation workflows with cross-service coordination
 */
export interface AgentService {
  /**
   * Create a new agent configuration with comprehensive validation and service coordination
   *
   * Coordinates with:
   * - ValidationService: Validates agent configuration structure and business rules
   * - PersonalityService: Validates personality ID and retrieves personality data
   * - RoleService: Validates role requirements and capabilities
   * - ModelService: Validates model ID and compatibility
   * - PersistenceService: Stores the validated agent configuration
   *
   * @param config - Complete agent creation request with all required fields
   * @returns Promise resolving to the created agent configuration
   * @throws {ValidationError} When configuration validation fails
   * @throws {ServiceError} When cross-service coordination fails
   * @throws {PersistenceError} When agent storage fails
   */
  createAgent(config: AgentCreateRequest): Promise<ServiceAgent>;

  /**
   * Validate agent configuration before creation with cross-service validation
   *
   * Performs comprehensive validation including:
   * - Schema validation: Ensures configuration structure is valid
   * - Cross-service validation: Validates personality, role, and model references
   * - Business rule validation: Applies agent-specific business constraints
   * - Capability validation: Ensures capabilities are compatible with role
   * - Constraint validation: Validates constraint compliance
   *
   * @param config - Agent configuration to validate
   * @returns Promise resolving to validation result with detailed error context
   */
  validateAgentConfiguration(
    config: AgentCreateRequest,
  ): Promise<ValidationResult>;

  /**
   * Update existing agent configuration with validation and dependency checks
   *
   * Coordinates updates with:
   * - ValidationService: Validates update request and modified configuration
   * - Dependency checking: Ensures updates don't break existing dependencies
   * - Version management: Handles optimistic locking for concurrent updates
   * - Audit trail: Records configuration changes with timestamps
   *
   * @param agentId - Unique identifier of the agent to update
   * @param updates - Partial configuration updates to apply
   * @returns Promise resolving to the updated agent configuration
   * @throws {NotFoundError} When agent ID does not exist
   * @throws {ValidationError} When update validation fails
   * @throws {ConflictError} When version conflicts occur
   */
  updateAgentConfiguration(
    agentId: string,
    updates: AgentUpdateRequest,
  ): Promise<ServiceAgent>;

  /**
   * Retrieve complete agent configuration by ID with relationship data
   *
   * Returns agent configuration with:
   * - Core agent properties and metadata
   * - Referenced personality data (if available)
   * - Role information and capabilities
   * - Model configuration details
   * - Current status and activity state
   *
   * @param agentId - Unique identifier of the agent to retrieve
   * @returns Promise resolving to the agent configuration or null if not found
   */
  getAgentConfiguration(agentId: string): Promise<ServiceAgent | null>;

  /**
   * Delete agent configuration with dependency cleanup and safety checks
   *
   * Performs safe deletion with:
   * - Dependency analysis: Checks for active usage in conversations or workflows
   * - Cascade cleanup: Removes associated metadata and references
   * - Audit trail: Records deletion event with context
   * - Recovery capability: Supports soft deletion for enterprise requirements
   *
   * @param agentId - Unique identifier of the agent to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {NotFoundError} When agent ID does not exist
   * @throws {DependencyError} When agent has active dependencies
   * @throws {AuthorizationError} When user lacks deletion permissions
   */
  deleteAgent(agentId: string): Promise<void>;
}
