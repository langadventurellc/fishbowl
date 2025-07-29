/**
 * @fileoverview Template Service Mock Factory
 *
 * Mock factory for template services following established patterns in the project.
 */

import type { TemplateService } from "../../../types/services";
import type { CustomRole, ValidationResult } from "../../../types/role";
import { RoleTestDataBuilder } from "./RoleTestDataBuilder";

/**
 * Configuration for template service mock responses
 */
interface TemplateServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  returnValue?: unknown;
  latency?: number;
}

/**
 * Template Service Mock Factory
 * Creates mocked template service instances with configurable behavior
 */
export class TemplateServiceMockFactory {
  private static defaultConfig: TemplateServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
  };

  static create(
    config: TemplateServiceMockConfig = {},
  ): jest.Mocked<TemplateService> {
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
          mergedConfig.errorMessage ?? "Template service operation failed",
        );
      }

      return operation();
    };

    return {
      getTemplate: jest.fn().mockImplementation(async (templateId: string) => {
        return simulateOperation(() => {
          if (templateId === "not-found") return null;

          const template: CustomRole = {
            ...RoleTestDataBuilder.createTemplateRole(),
            id: templateId,
            isTemplate: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
          };
          return mergedConfig.returnValue ?? template;
        });
      }),

      listTemplates: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          const templates: CustomRole[] = [
            {
              ...RoleTestDataBuilder.createTemplateRole(),
              id: "template-research-001",
              name: "Research Specialist Template",
              isTemplate: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 1,
            },
            {
              ...RoleTestDataBuilder.createTemplateRole(),
              id: "template-analytics-001",
              name: "Analytics Specialist Template",
              isTemplate: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 1,
            },
          ];
          return mergedConfig.returnValue ?? templates;
        });
      }),

      validateTemplateAccess: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          const result: ValidationResult = {
            isValid: mergedConfig.shouldSucceed ?? true,
            errors: mergedConfig.shouldSucceed
              ? []
              : [
                  {
                    field: "access",
                    message:
                      mergedConfig.errorMessage ?? "Template access denied",
                  },
                ],
          };
          return mergedConfig.returnValue ?? result;
        });
      }),

      copyTemplateData: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          const templateData = RoleTestDataBuilder.createTemplateBasedRole();
          return mergedConfig.returnValue ?? templateData;
        });
      }),

      validateTemplateVersion: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          const result: ValidationResult = {
            isValid: mergedConfig.shouldSucceed ?? true,
            errors: mergedConfig.shouldSucceed
              ? []
              : [
                  {
                    field: "version",
                    message:
                      mergedConfig.errorMessage ??
                      "Template version incompatible",
                  },
                ],
          };
          return mergedConfig.returnValue ?? result;
        });
      }),
    } as jest.Mocked<TemplateService>;
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

  static createAccessDenied(errorMessage: string = "Template access denied") {
    return this.create({
      shouldSucceed: true,
      returnValue: {
        isValid: false,
        errors: [{ field: "access", message: errorMessage }],
      },
    });
  }

  static createVersionIncompatible(
    errorMessage: string = "Template version incompatible",
  ) {
    return this.create({
      shouldSucceed: true,
      returnValue: {
        isValid: false,
        errors: [{ field: "version", message: errorMessage }],
      },
    });
  }
}
