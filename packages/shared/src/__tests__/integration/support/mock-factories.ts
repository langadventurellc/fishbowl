/**
 * @fileoverview Mock Factories for Personality Management Tests
 *
 * Provides consistent mocking for external dependencies with configurable
 * responses and realistic behavior simulation.
 */

import type {
  PersonalityConfiguration,
  PersonalityCreationData,
} from "../../../types/personality";

/**
 * Configuration for database mock responses
 */
interface DatabaseMockConfig {
  shouldFail?: boolean;
  latency?: number;
  errorType?: "constraint" | "connection" | "timeout" | "unknown";
  customError?: Error;
}

/**
 * Mock factory for database operations
 */
export class DatabaseMockFactory {
  private static defaultConfig: DatabaseMockConfig = {
    shouldFail: false,
    latency: 50,
  };

  /**
   * Create mock database with configurable behavior
   */
  static create(config: DatabaseMockConfig = {}): {
    insert: jest.MockedFunction<
      (data: PersonalityCreationData) => Promise<PersonalityConfiguration>
    >;
    findById: jest.MockedFunction<
      (id: string) => Promise<PersonalityConfiguration | null>
    >;
    update: jest.MockedFunction<
      (
        id: string,
        data: Partial<PersonalityCreationData>,
      ) => Promise<PersonalityConfiguration>
    >;
    delete: jest.MockedFunction<(id: string) => Promise<void>>;
    findAll: jest.MockedFunction<() => Promise<PersonalityConfiguration[]>>;
  } {
    const mergedConfig = { ...this.defaultConfig, ...config };

    const simulateOperation = async <T>(operation: () => T): Promise<T> => {
      // Simulate network latency
      if (mergedConfig.latency && mergedConfig.latency > 0) {
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, mergedConfig.latency),
        );
      }

      // Simulate failures
      if (mergedConfig.shouldFail) {
        if (mergedConfig.customError) {
          throw mergedConfig.customError;
        }

        switch (mergedConfig.errorType) {
          case "constraint":
            throw new Error("UNIQUE constraint violation: name already exists");
          case "connection":
            throw new Error("Database connection failed");
          case "timeout":
            throw new Error("Operation timeout");
          default:
            throw new Error("Database operation failed");
        }
      }

      return operation();
    };

    return {
      insert: jest
        .fn()
        .mockImplementation(async (data: PersonalityCreationData) => {
          return simulateOperation(() => ({
            ...data,
            id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }),

      findById: jest.fn().mockImplementation(async (id: string) => {
        return simulateOperation(() => {
          if (id === "not-found") return null;
          return {
            id,
            name: `Mock Personality ${id}`,
            description: "Mock personality for testing",
            isTemplate: false,
            openness: 75,
            conscientiousness: 80,
            extraversion: 60,
            agreeableness: 85,
            neuroticism: 40,
            formality: 60,
            humor: 70,
            assertiveness: 65,
            empathy: 80,
            storytelling: 55,
            brevity: 45,
            imagination: 75,
            playfulness: 60,
            dramaticism: 40,
            analyticalDepth: 85,
            contrarianism: 30,
            encouragement: 90,
            curiosity: 80,
            patience: 70,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });
      }),

      update: jest
        .fn()
        .mockImplementation(
          async (id: string, data: Partial<PersonalityCreationData>) => {
            return simulateOperation(() => ({
              id,
              name: data.name || `Updated Personality ${id}`,
              description: data.description || "Updated mock personality",
              isTemplate: data.isTemplate || false,
              openness: data.openness || 75,
              conscientiousness: data.conscientiousness || 80,
              extraversion: data.extraversion || 60,
              agreeableness: data.agreeableness || 85,
              neuroticism: data.neuroticism || 40,
              formality: data.formality || 60,
              humor: data.humor || 70,
              assertiveness: data.assertiveness || 65,
              empathy: data.empathy || 80,
              storytelling: data.storytelling || 55,
              brevity: data.brevity || 45,
              imagination: data.imagination || 75,
              playfulness: data.playfulness || 60,
              dramaticism: data.dramaticism || 40,
              analyticalDepth: data.analyticalDepth || 85,
              contrarianism: data.contrarianism || 30,
              encouragement: data.encouragement || 90,
              curiosity: data.curiosity || 80,
              patience: data.patience || 70,
              customInstructions: data.customInstructions,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
          },
        ),

      delete: jest.fn().mockImplementation(async (id: string) => {
        return simulateOperation(() => {
          if (id === "not-found") {
            throw new Error("Personality not found");
          }
          // Success - no return value
        });
      }),

      findAll: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => [
          {
            id: "mock-1",
            name: "Creative Template",
            description: "Highly creative personality",
            isTemplate: true,
            openness: 90,
            conscientiousness: 60,
            extraversion: 70,
            agreeableness: 75,
            neuroticism: 45,
            formality: 40,
            humor: 80,
            assertiveness: 70,
            empathy: 85,
            storytelling: 90,
            brevity: 30,
            imagination: 95,
            playfulness: 85,
            dramaticism: 70,
            analyticalDepth: 60,
            contrarianism: 40,
            encouragement: 80,
            curiosity: 95,
            patience: 60,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }),
    };
  }

  /**
   * Create mock that always succeeds
   */
  static createSuccess(latency = 10) {
    return this.create({ shouldFail: false, latency });
  }

  /**
   * Create mock that always fails with constraint error
   */
  static createConstraintFailure(latency = 10) {
    return this.create({ shouldFail: true, errorType: "constraint", latency });
  }

  /**
   * Create mock that always fails with connection error
   */
  static createConnectionFailure(latency = 100) {
    return this.create({ shouldFail: true, errorType: "connection", latency });
  }
}

/**
 * Configuration for validation service mock
 */
interface ValidationMockConfig {
  shouldFail?: boolean;
  validationErrors?: string[];
  latency?: number;
}

/**
 * Mock factory for validation service
 */
export class ValidationServiceMockFactory {
  private static defaultConfig: ValidationMockConfig = {
    shouldFail: false,
    latency: 5,
  };

  /**
   * Create mock validation service
   */
  static create(config: ValidationMockConfig = {}) {
    const mergedConfig = { ...this.defaultConfig, ...config };

    return {
      validatePersonality: jest.fn().mockImplementation(async () => {
        // Simulate validation latency
        if (mergedConfig.latency && mergedConfig.latency > 0) {
          await new Promise((resolve) =>
            globalThis.setTimeout(resolve, mergedConfig.latency),
          );
        }

        if (mergedConfig.shouldFail) {
          const errors = mergedConfig.validationErrors || ["Validation failed"];
          throw new Error(`Validation errors: ${errors.join(", ")}`);
        }

        return { valid: true, errors: [] };
      }),

      validateTraitRanges: jest.fn().mockImplementation(async () => {
        if (mergedConfig.latency && mergedConfig.latency > 0) {
          await new Promise((resolve) =>
            globalThis.setTimeout(resolve, mergedConfig.latency),
          );
        }

        if (mergedConfig.shouldFail) {
          return {
            valid: false,
            errors: mergedConfig.validationErrors || ["Invalid trait values"],
          };
        }

        return { valid: true, errors: [] };
      }),
    };
  }

  /**
   * Create validation mock that succeeds
   */
  static createSuccess() {
    return this.create({ shouldFail: false });
  }

  /**
   * Create validation mock that fails with specific errors
   */
  static createFailure(errors: string[]) {
    return this.create({ shouldFail: true, validationErrors: errors });
  }
}

/**
 * Mock factory for external API calls
 */
export class ExternalApiMockFactory {
  /**
   * Create mock for personality analysis API
   */
  static createPersonalityAnalysisApi(
    config: { shouldFail?: boolean; latency?: number } = {},
  ) {
    return {
      analyzePersonality: jest.fn().mockImplementation(async () => {
        if (config.latency) {
          await new Promise((resolve) =>
            globalThis.setTimeout(resolve, config.latency),
          );
        }

        if (config.shouldFail) {
          throw new Error("External API unavailable");
        }

        return {
          analysisId: `analysis-${Date.now()}`,
          insights: ["High creativity detected", "Well-balanced personality"],
          compatibilityScore: 85,
          recommendations: [
            "Great for creative roles",
            "Works well in team environments",
          ],
        };
      }),
    };
  }

  /**
   * Create mock for template repository API
   */
  static createTemplateRepositoryApi(
    config: { shouldFail?: boolean; latency?: number } = {},
  ) {
    return {
      fetchTemplates: jest.fn().mockImplementation(async () => {
        if (config.latency) {
          await new Promise((resolve) =>
            globalThis.setTimeout(resolve, config.latency),
          );
        }

        if (config.shouldFail) {
          throw new Error("Template repository unavailable");
        }

        return [
          {
            id: "template-1",
            name: "Creative Professional",
            category: "creative",
          },
          {
            id: "template-2",
            name: "Analytical Thinker",
            category: "analytical",
          },
        ];
      }),
    };
  }
}
