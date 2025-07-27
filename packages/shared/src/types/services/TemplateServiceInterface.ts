/**
 * @fileoverview Template Service Interface
 *
 * Service interface for template-based role operations and template management.
 */

import type {
  CustomRole,
  CustomRoleCreateRequest,
  ValidationResult,
  SecurityContext,
} from "../role";

/**
 * Template Service Interface
 * Handles template-based role operations and template management
 */
export interface TemplateService {
  /**
   * Retrieve a predefined role template by ID
   */
  getTemplate(templateId: string): Promise<CustomRole | null>;

  /**
   * List all available role templates
   */
  listTemplates(): Promise<CustomRole[]>;

  /**
   * Validate user access to a specific template
   */
  validateTemplateAccess(
    templateId: string,
    context: SecurityContext,
  ): Promise<ValidationResult>;

  /**
   * Copy template data for custom role creation
   * Deep copies template data to prevent reference sharing
   */
  copyTemplateData(templateId: string): Promise<CustomRoleCreateRequest>;

  /**
   * Validate template version compatibility
   */
  validateTemplateVersion(
    templateId: string,
    requiredVersion?: string,
  ): Promise<ValidationResult>;
}
