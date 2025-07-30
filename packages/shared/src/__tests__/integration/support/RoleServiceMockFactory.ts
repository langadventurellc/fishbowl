/**
 * @fileoverview Role Service Mock Factory
 *
 * Mock factory for role services following established patterns in the project.
 */

import type {
  RoleService,
  PersistenceService,
  ValidationService,
} from "../../../types/services";
import type { CustomRole, ValidationResult } from "../../../types/role";
import { RoleTestDataBuilder } from "./RoleTestDataBuilder";

/**
 * Configuration for service mock responses
 */
interface ServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  returnValue?: unknown;
  latency?: number;
}

/**
 * Enhanced role service with transaction rollback support
 */
interface RoleServiceWithTransaction extends jest.Mocked<RoleService> {
  rollbackRole: jest.MockedFunction<(roleId?: string) => Promise<void>> & {
    lastCallTime?: number;
    lastCallId?: string;
  };
  createRole: jest.MockedFunction<
    (roleData: unknown) => Promise<CustomRole>
  > & {
    lastCallTime?: number;
  };
}

/**
 * Role Service Mock Factory
 * Creates mocked role service instances with configurable behavior
 */
export class RoleServiceMockFactory {
  private static defaultConfig: ServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
  };

  static create(config: ServiceMockConfig = {}): jest.Mocked<RoleService> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    const simulateOperation = async <T>(operation: () => T): Promise<T> => {
      // Simulate network latency
      if (mergedConfig.latency && mergedConfig.latency > 0) {
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, mergedConfig.latency),
        );
      }

      // Simulate failures
      if (!mergedConfig.shouldSucceed) {
        throw new Error(
          mergedConfig.errorMessage ?? "Role service operation failed",
        );
      }

      return operation();
    };

    return {
      createCustomRole: jest.fn().mockImplementation(async (roleData) => {
        return simulateOperation(() => {
          const createdRole: CustomRole = {
            ...roleData,
            id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
          };
          return mergedConfig.returnValue ?? createdRole;
        });
      }),

      getCustomRole: jest.fn().mockImplementation(async (roleId: string) => {
        return simulateOperation(() => {
          if (roleId === "not-found") return null;

          const role: CustomRole = {
            ...RoleTestDataBuilder.createCustomRole(),
            id: roleId,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
          };
          return mergedConfig.returnValue ?? role;
        });
      }),

      updateCustomRole: jest
        .fn()
        .mockImplementation(async (roleId: string, updates) => {
          return simulateOperation(() => {
            const updatedRole: CustomRole = {
              ...RoleTestDataBuilder.createCustomRole(),
              ...updates,
              id: roleId,
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 2,
            };
            return mergedConfig.returnValue ?? updatedRole;
          });
        }),

      deleteCustomRole: jest.fn().mockImplementation(async (roleId: string) => {
        return simulateOperation(() => {
          if (roleId === "has-dependencies") {
            throw new Error("Cannot delete role: 3 agents are using this role");
          }
          // Success - no return value
        });
      }),

      listCustomRoles: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          const roles = [
            {
              ...RoleTestDataBuilder.createCustomRole(),
              id: "role-1",
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 1,
            },
            {
              ...RoleTestDataBuilder.createComplexRole(),
              id: "role-2",
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 1,
            },
          ];
          return mergedConfig.returnValue ?? roles;
        });
      }),

      validateRoleCapabilities: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          const result: ValidationResult = {
            isValid: mergedConfig.shouldSucceed ?? true,
            errors: mergedConfig.shouldSucceed
              ? []
              : [
                  {
                    field: "capabilities",
                    message:
                      mergedConfig.errorMessage ?? "Invalid capabilities",
                  },
                ],
          };
          return mergedConfig.returnValue ?? result;
        });
      }),

      createCustomRoleFromTemplate: jest
        .fn()
        .mockImplementation(async (templateId, customizations) => {
          return simulateOperation(() => {
            const templateBasedRole: CustomRole = {
              ...RoleTestDataBuilder.createRoleFromTemplateWithModifications(),
              ...customizations,
              id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              templateId,
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 1,
            };
            return mergedConfig.returnValue ?? templateBasedRole;
          });
        }),

      trackTemplateReference: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          const templateMetadata = {
            templateId: "template-001",
            templateVersion: "1.0.0",
            templateSource: "predefined_template",
            derivedAt: new Date(),
            customizations: ["capabilities", "constraints"],
          };
          return mergedConfig.returnValue ?? templateMetadata;
        });
      }),

      updateTemplateReference: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          const updatedReference = {
            templateId: "template-001",
            customizations: ["capabilities", "constraints"],
            lastModified: new Date(),
          };
          return mergedConfig.returnValue ?? updatedReference;
        });
      }),
    } as jest.Mocked<RoleService>;
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

  /**
   * Create RoleService mock with rollback capabilities for transaction testing
   * Adds rollback and timing-aware creation methods for transaction consistency testing
   */
  static createWithRollbackSupport(
    config: ServiceMockConfig = {},
  ): RoleServiceWithTransaction {
    const baseService = this.create(config);

    // Add rollback method for transaction consistency
    const rollbackMock = jest
      .fn()
      .mockImplementation(async (roleId?: string) => {
        if (!config.shouldSucceed) {
          throw new Error(config.errorMessage ?? "Role rollback failed");
        }
        // Track rollback calls for verification
        const typedRollback = rollbackMock as jest.MockedFunction<
          (roleId?: string) => Promise<void>
        > & {
          lastCallTime?: number;
          lastCallId?: string;
        };
        typedRollback.lastCallTime = Date.now();
        typedRollback.lastCallId = roleId;
      });

    // Add timing-aware createRole method
    const createRoleMock = jest
      .fn()
      .mockImplementation(async (roleData: unknown) => {
        const startTime = Date.now();
        // Simulate role creation
        const result = {
          ...(roleData as CustomRole),
          id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        } as CustomRole;
        const typedCreate = createRoleMock as jest.MockedFunction<
          (roleData: unknown) => Promise<CustomRole>
        > & {
          lastCallTime?: number;
        };
        typedCreate.lastCallTime = startTime;
        return result;
      });

    const enhancedService =
      baseService as unknown as RoleServiceWithTransaction;
    enhancedService.rollbackRole =
      rollbackMock as RoleServiceWithTransaction["rollbackRole"];
    enhancedService.createRole =
      createRoleMock as RoleServiceWithTransaction["createRole"];

    return enhancedService;
  }
}

/**
 * Persistence Service Mock Factory
 * Creates mocked persistence service instances
 */
export class PersistenceServiceMockFactory {
  private static defaultConfig: ServiceMockConfig = {
    shouldSucceed: true,
    latency: 5,
  };

  static create(
    config: ServiceMockConfig = {},
  ): jest.Mocked<PersistenceService> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    const simulateOperation = async <T>(operation: () => T): Promise<T> => {
      if (mergedConfig.latency && mergedConfig.latency > 0) {
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, mergedConfig.latency),
        );
      }

      if (!mergedConfig.shouldSucceed) {
        throw new Error(
          mergedConfig.errorMessage ?? "Persistence operation failed",
        );
      }

      return operation();
    };

    return {
      save: jest.fn().mockImplementation(async (entity) => {
        return simulateOperation(() => mergedConfig.returnValue ?? entity);
      }),

      findById: jest.fn().mockImplementation(async (id: string) => {
        return simulateOperation(() => {
          if (id === "not-found") return null;
          return (
            mergedConfig.returnValue ?? {
              id,
              ...RoleTestDataBuilder.createCustomRole(),
            }
          );
        });
      }),

      update: jest.fn().mockImplementation(async (id: string, updates) => {
        return simulateOperation(() => {
          if (id === "version-conflict") {
            throw new Error("Version conflict: Role has been modified");
          }
          return mergedConfig.returnValue ?? { id, ...updates };
        });
      }),

      delete: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => undefined);
      }),

      findAll: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => mergedConfig.returnValue ?? []);
      }),

      exists: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => mergedConfig.returnValue ?? true);
      }),

      count: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => mergedConfig.returnValue ?? 0);
      }),
    } as jest.Mocked<PersistenceService>;
  }

  static createSuccess(returnValue?: unknown) {
    return this.create({ shouldSucceed: true, returnValue });
  }

  static createFailure(errorMessage: string) {
    return this.create({ shouldSucceed: false, errorMessage });
  }
}

/**
 * Validation Service Mock Factory
 * Creates mocked validation service instances
 */
export class ValidationServiceMockFactory {
  private static defaultConfig: ServiceMockConfig = {
    shouldSucceed: true,
    latency: 5,
  };

  static create(
    config: ServiceMockConfig = {},
  ): jest.Mocked<ValidationService> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    const simulateOperation = async <T>(operation: () => T): Promise<T> => {
      if (mergedConfig.latency && mergedConfig.latency > 0) {
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, mergedConfig.latency),
        );
      }

      return operation();
    };

    const createValidationResult = (
      isValid: boolean = true,
      errors: Array<{ field: string; message: string }> = [],
    ): ValidationResult => ({
      isValid,
      errors,
    });

    return {
      validateEntity: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          return (
            mergedConfig.returnValue ??
            createValidationResult(mergedConfig.shouldSucceed)
          );
        });
      }),

      validateBusinessRules: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          return (
            mergedConfig.returnValue ??
            createValidationResult(mergedConfig.shouldSucceed)
          );
        });
      }),

      validateSecurityConstraints: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          return (
            mergedConfig.returnValue ??
            createValidationResult(mergedConfig.shouldSucceed)
          );
        });
      }),

      validateUniqueness: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          return (
            mergedConfig.returnValue ??
            createValidationResult(mergedConfig.shouldSucceed)
          );
        });
      }),

      validateDependencies: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          return (
            mergedConfig.returnValue ??
            createValidationResult(mergedConfig.shouldSucceed)
          );
        });
      }),
    } as jest.Mocked<ValidationService>;
  }

  static createSuccess() {
    return this.create({ shouldSucceed: true });
  }

  static createFailure(errorMessage: string) {
    return this.create({
      shouldSucceed: false,
      returnValue: {
        isValid: false,
        errors: [{ field: "general", message: errorMessage }],
      },
    });
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
