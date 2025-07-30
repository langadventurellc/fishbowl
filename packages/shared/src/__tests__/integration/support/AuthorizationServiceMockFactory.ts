/**
 * @fileoverview Authorization Service Mock Factory
 *
 * Mock factory for authorization services following established patterns in the project.
 */

import type { AuthorizationService } from "../../../types/services";
import type { ValidationResult, SecurityContext } from "../../../types/role";

/**
 * Configuration for authorization service mock responses
 */
interface AuthorizationServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  returnValue?: unknown;
  latency?: number;
}

/**
 * Authorization Service Mock Factory
 * Creates mocked authorization service instances with configurable behavior
 */
export class AuthorizationServiceMockFactory {
  private static defaultConfig: AuthorizationServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
  };

  static create(
    config: AuthorizationServiceMockConfig = {},
  ): jest.Mocked<AuthorizationService> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    return {
      validateRolePermissions: jest
        .fn()
        .mockImplementation(this.createRolePermissionsMock(mergedConfig)),
      authorizeCustomRoleCreation: jest
        .fn()
        .mockImplementation(this.createRoleCreationMock(mergedConfig)),
      validateAccessControl: jest
        .fn()
        .mockImplementation(this.createAccessControlMock(mergedConfig)),
    } as jest.Mocked<AuthorizationService>;
  }

  private static createRolePermissionsMock(
    mergedConfig: AuthorizationServiceMockConfig,
  ) {
    return async (capabilities: string[], context: SecurityContext) => {
      return this.simulateOperation(mergedConfig, () => {
        // Simulate permission validation logic
        const errors: Array<{ field: string; message: string }> = [];

        // Check if user has basic permissions
        const userPermissions = context.permissions || [];
        if (!userPermissions.includes("custom_role_creation")) {
          errors.push({
            field: "permissions",
            message: "Insufficient permissions for custom role creation",
          });
        }

        // Check for security capabilities requiring elevated permissions
        const securityCapabilities = capabilities.filter((cap) =>
          cap.includes("security"),
        );
        if (
          securityCapabilities.length > 0 &&
          !userPermissions.includes("security_management")
        ) {
          errors.push({
            field: "capabilities",
            message: "User lacks authorization for security capabilities",
          });
        }

        // Check for limited user permissions
        if (context.userId === "limited-user-001") {
          errors.push({
            field: "permissions",
            message: "Insufficient permissions for custom role creation",
          });
          errors.push({
            field: "capabilities",
            message: "User lacks authorization for security capabilities",
          });
        }

        const shouldSucceed = mergedConfig.shouldSucceed ?? true;
        const hasErrors = errors.length > 0;

        const result: ValidationResult = {
          isValid: shouldSucceed && !hasErrors,
          errors:
            shouldSucceed && !hasErrors
              ? []
              : hasErrors
                ? errors
                : [
                    {
                      field: "permissions",
                      message: "Insufficient permissions for role capabilities",
                    },
                  ],
        };
        return mergedConfig.returnValue ?? result;
      });
    };
  }

  private static createRoleCreationMock(
    mergedConfig: AuthorizationServiceMockConfig,
  ) {
    return async (roleData: unknown, context: SecurityContext) => {
      return this.simulateOperation(mergedConfig, () => {
        // Simulate role creation authorization logic
        const userPermissions = context.permissions || [];
        const userRoles = context.roles || [];

        // Check basic authorization
        if (!userPermissions.includes("custom_role_creation")) {
          return this.createValidationResult(false, [
            {
              field: "authorization",
              message: "Custom role creation not authorized",
            },
          ]);
        }

        // Check for limited user context
        if (context.userId === "limited-user-001") {
          return this.createValidationResult(false, [
            {
              field: "authorization",
              message: "Custom role creation not authorized",
            },
          ]);
        }

        // Check for hierarchical permissions for admin users
        if (
          userRoles.includes("admin") &&
          userPermissions.includes("role_hierarchy_administration")
        ) {
          return this.createValidationResult(true);
        }

        const result: ValidationResult = {
          isValid: mergedConfig.shouldSucceed ?? true,
          errors: mergedConfig.shouldSucceed
            ? []
            : [
                {
                  field: "authorization",
                  message: "Unauthorized custom role creation",
                },
              ],
        };
        return mergedConfig.returnValue ?? result;
      });
    };
  }

  private static createAccessControlMock(
    mergedConfig: AuthorizationServiceMockConfig,
  ) {
    return async (capability: string, context: SecurityContext) => {
      return this.simulateOperation(mergedConfig, () => {
        // Simulate access control validation logic
        const userPermissions = context.permissions || [];

        // Check for specific capability access requirements
        if (capability === "security_assessment") {
          if (!userPermissions.includes("security_management")) {
            return this.createValidationResult(false, [
              {
                field: "access_control",
                message: "Access control violation for capability",
              },
            ]);
          }
        }

        const result: ValidationResult = {
          isValid: mergedConfig.shouldSucceed ?? true,
          errors: mergedConfig.shouldSucceed
            ? []
            : [
                {
                  field: "access_control",
                  message: "Access control violation for capability",
                },
              ],
        };
        return mergedConfig.returnValue ?? result;
      });
    };
  }

  private static async simulateOperation<T>(
    config: AuthorizationServiceMockConfig,
    operation: () => T,
  ): Promise<T> {
    // Simulate network latency
    if (config.latency && config.latency > 0) {
      await new Promise((resolve) =>
        globalThis.setTimeout(resolve, config.latency),
      );
    }

    // Simulate failures
    if (!config.shouldSucceed) {
      throw new Error(
        config.errorMessage ?? "Authorization service operation failed",
      );
    }

    return operation();
  }

  private static createValidationResult(
    isValid: boolean = true,
    errors: Array<{ field: string; message: string }> = [],
  ): ValidationResult {
    return {
      isValid,
      errors,
    };
  }

  static createSuccess(returnValue?: unknown) {
    return this.create({ shouldSucceed: true, returnValue });
  }

  static createFailure(errorMessage: string) {
    return this.create({ shouldSucceed: false, errorMessage });
  }

  static createWithLatency(latency: number) {
    return this.create({ shouldSucceed: true, latency });
  }

  static createValidationFailure(field: string, message: string) {
    return this.create({
      shouldSucceed: true,
      returnValue: {
        isValid: false,
        errors: [{ field, message }],
      },
    });
  }
}
