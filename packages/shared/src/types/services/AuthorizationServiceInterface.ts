/**
 * @fileoverview Authorization Service Interface
 *
 * Service interface for authorization and permission validation in custom role management.
 * Handles role permissions, access control, and authorization policies.
 */

import type { ValidationResult, SecurityContext } from "../role";

/**
 * Authorization Service Interface
 * Provides authorization validation and access control for custom roles
 */
export interface AuthorizationService {
  /**
   * Validate role permissions against authorization policies
   *
   * @param capabilities - Array of capability identifiers to validate permissions for
   * @param context - Security context containing user permissions and roles
   * @returns Promise resolving to validation result for permission authorization
   */
  validateRolePermissions(
    capabilities: string[],
    context: SecurityContext,
  ): Promise<ValidationResult>;

  /**
   * Authorize custom role creation for the given context
   *
   * @param roleData - The role data to authorize creation for
   * @param context - Security context for authorization evaluation
   * @returns Promise resolving to validation result for creation authorization
   */
  authorizeCustomRoleCreation(
    roleData: unknown,
    context: SecurityContext,
  ): Promise<ValidationResult>;

  /**
   * Validate access control constraints for capability
   *
   * @param capability - The capability identifier to validate access for
   * @param context - Security context for access control evaluation
   * @returns Promise resolving to validation result for access control compliance
   */
  validateAccessControl(
    capability: string,
    context: SecurityContext,
  ): Promise<ValidationResult>;
}
