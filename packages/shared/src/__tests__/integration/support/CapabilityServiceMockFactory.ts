/**
 * @fileoverview Capability Service Mock Factory
 *
 * Mock factory for capability services following established patterns in the project.
 */

import type { CapabilityService } from "../../../types/services";
import type { ValidationResult } from "../../../types/role";

/**
 * Configuration for capability service mock responses
 */
interface CapabilityServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  returnValue?: unknown;
  latency?: number;
}

/**
 * Capability Service Mock Factory
 * Creates mocked capability service instances with configurable behavior
 */
export class CapabilityServiceMockFactory {
  private static defaultConfig: CapabilityServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
  };

  static create(
    config: CapabilityServiceMockConfig = {},
  ): jest.Mocked<CapabilityService> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    return {
      validateCapabilityDefinition: jest
        .fn()
        .mockImplementation(this.createCapabilityDefinitionMock(mergedConfig)),
      validateCapabilityCombination: jest
        .fn()
        .mockImplementation(this.createCapabilityCombinationMock(mergedConfig)),
      validateCapabilityScope: jest
        .fn()
        .mockImplementation(this.createCapabilityScopeMock(mergedConfig)),
      validateCapabilityConstraints: jest
        .fn()
        .mockImplementation(this.createCapabilityConstraintsMock(mergedConfig)),
    } as jest.Mocked<CapabilityService>;
  }

  private static createCapabilityDefinitionMock(
    mergedConfig: CapabilityServiceMockConfig,
  ) {
    return async (capability: string) => {
      return this.simulateOperation(mergedConfig, () => {
        // Simulate validation logic for invalid capability names
        if (
          capability.includes("!") ||
          capability.includes("@") ||
          capability.includes("#")
        ) {
          return this.createValidationResult(false, [
            {
              field: "capability",
              message: "Invalid capability naming convention",
            },
          ]);
        }

        const result: ValidationResult = {
          isValid: mergedConfig.shouldSucceed ?? true,
          errors: mergedConfig.shouldSucceed
            ? []
            : [
                {
                  field: "capability",
                  message:
                    mergedConfig.errorMessage ??
                    "Invalid capability definition",
                },
              ],
        };
        return mergedConfig.returnValue ?? result;
      });
    };
  }

  private static createCapabilityCombinationMock(
    mergedConfig: CapabilityServiceMockConfig,
  ) {
    return async (capabilities: string[]) => {
      return this.simulateOperation(mergedConfig, () => {
        // Simulate conflict detection logic
        const conflicts: Array<{ field: string; message: string }> = [];

        if (
          capabilities.includes("real_time_processing") &&
          capabilities.includes("batch_analytics")
        ) {
          conflicts.push({
            field: "capabilities",
            message:
              "Conflict between real_time_processing and batch_analytics requirements",
          });
        }

        if (
          capabilities.includes("memory_intensive_operations") &&
          capabilities.includes("low_latency_response")
        ) {
          conflicts.push({
            field: "capabilities",
            message:
              "Memory intensive operations incompatible with low latency requirements",
          });
        }

        const shouldSucceed = mergedConfig.shouldSucceed ?? true;
        const hasConflicts = conflicts.length > 0;

        const result: ValidationResult = {
          isValid: shouldSucceed && !hasConflicts,
          errors:
            shouldSucceed && !hasConflicts
              ? []
              : hasConflicts
                ? conflicts
                : [
                    {
                      field: "capabilities",
                      message: "Capability combination conflict detected",
                    },
                  ],
        };
        return mergedConfig.returnValue ?? result;
      });
    };
  }

  private static createCapabilityScopeMock(
    mergedConfig: CapabilityServiceMockConfig,
  ) {
    return async (capability: string, domain: string) => {
      return this.simulateOperation(mergedConfig, () => {
        // Simulate domain validation logic
        if (domain === "non_existent_domain") {
          return this.createValidationResult(false, [
            {
              field: "domain",
              message: "Domain not found in capability registry",
            },
          ]);
        }

        const result: ValidationResult = {
          isValid: mergedConfig.shouldSucceed ?? true,
          errors: mergedConfig.shouldSucceed
            ? []
            : [
                {
                  field: "capability",
                  message: "Capability outside allowed scope",
                },
              ],
        };
        return mergedConfig.returnValue ?? result;
      });
    };
  }

  private static createCapabilityConstraintsMock(
    mergedConfig: CapabilityServiceMockConfig,
  ) {
    return async (capability: string, constraints: string[]) => {
      return this.simulateOperation(mergedConfig, () => {
        // Simulate constraint validation logic
        const violations: Array<{ field: string; message: string }> = [];

        if (
          capability === "financial_advice" &&
          constraints.includes("no_financial_advice")
        ) {
          violations.push({
            field: "capabilities",
            message:
              "Capability 'financial_advice' violates constraint 'no_financial_advice'",
          });
        }

        if (
          capability === "legal_consultation" &&
          constraints.includes("no_legal_advice")
        ) {
          violations.push({
            field: "capabilities",
            message:
              "Capability 'legal_consultation' violates constraint 'no_legal_advice'",
          });
        }

        const shouldSucceed = mergedConfig.shouldSucceed ?? true;
        const hasViolations = violations.length > 0;

        const result: ValidationResult = {
          isValid: shouldSucceed && !hasViolations,
          errors:
            shouldSucceed && !hasViolations
              ? []
              : hasViolations
                ? violations
                : [
                    {
                      field: "constraints",
                      message: "Capability constraint violation",
                    },
                  ],
        };
        return mergedConfig.returnValue ?? result;
      });
    };
  }

  private static async simulateOperation<T>(
    config: CapabilityServiceMockConfig,
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
        config.errorMessage ?? "Capability service operation failed",
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
