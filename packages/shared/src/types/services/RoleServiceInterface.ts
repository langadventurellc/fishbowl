/**
 * @fileoverview Role Service Interface
 *
 * Service interface for custom role CRUD operations and business logic.
 */

import type {
  CustomRole,
  CustomRoleCreateRequest,
  CustomRoleUpdateRequest,
  RoleFilters,
  ValidationResult,
} from "../role";

/**
 * Role Service Interface
 * Orchestrates custom role CRUD operations with service coordination
 */
export interface RoleService {
  /**
   * Create a new custom role with validation and persistence
   */
  createCustomRole(roleData: CustomRoleCreateRequest): Promise<CustomRole>;

  /**
   * Retrieve a custom role by ID
   */
  getCustomRole(roleId: string): Promise<CustomRole | null>;

  /**
   * Update an existing custom role with validation
   */
  updateCustomRole(
    roleId: string,
    updates: CustomRoleUpdateRequest,
  ): Promise<CustomRole>;

  /**
   * Delete a custom role with dependency checking
   */
  deleteCustomRole(roleId: string): Promise<void>;

  /**
   * List custom roles with optional filtering
   */
  listCustomRoles(filters?: RoleFilters): Promise<CustomRole[]>;

  /**
   * Validate role capabilities against system constraints
   */
  validateRoleCapabilities(capabilities: string[]): Promise<ValidationResult>;
}
