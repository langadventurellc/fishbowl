/**
 * @fileoverview ReferenceService Mock Factory
 *
 * Test utilities for creating ReferenceService mocks with comprehensive configuration support.
 * Follows established patterns from AgentServiceMockFactory for consistency across test infrastructure.
 */

import type { ValidationResult } from "../../../types/role/ValidationResult";
import type {
  DependencyGraph,
  ReferenceResolutionResult,
  ReferenceService,
  ReferenceValidationRequest,
} from "../../../types/services";

/**
 * Configuration for ReferenceService mock responses
 */
export interface ReferenceServiceMockConfig {
  /** Simulate network latency (ms) */
  latency?: number;

  /** Force specific error responses */
  errors?: {
    validateReference?: Error;
    trackDependencies?: Error;
    detectCircularReferences?: Error;
    enforceIntegrity?: Error;
    resolveReferences?: Error;
    batchResolveReferences?: Error;
  };

  /** Custom response overrides */
  responses?: {
    validateReference?: ValidationResult;
    trackDependencies?: DependencyGraph;
    detectCircularReferences?: {
      hasCircularReferences: boolean;
      cycles: string[][];
      affectedEntities: string[];
    };
    enforceIntegrity?: ValidationResult;
    resolveReferences?: ReferenceResolutionResult;
    batchResolveReferences?: ReferenceResolutionResult;
  };

  /** Cross-service failure simulation */
  crossServiceFailures?: {
    serviceUnavailable?: boolean;
    networkTimeout?: boolean;
    authenticationFailure?: boolean;
    rateLimitExceeded?: boolean;
  };

  /** Performance simulation settings */
  performance?: {
    cacheHitRate?: number; // 0-1, default 0.8
    avgCrossServiceLatency?: number; // ms, default 50
    maxConcurrentResolve?: number; // default 10
  };
}

/**
 * Helper function to simulate operation latency and error conditions
 */
async function simulateOperation<T>(
  operation: () => T,
  config: ReferenceServiceMockConfig,
  operationName: string,
): Promise<T> {
  // Simulate latency
  if (config.latency && config.latency > 0) {
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, config.latency);
    });
  }

  // Check for error simulation
  const errorKey = operationName as keyof NonNullable<
    ReferenceServiceMockConfig["errors"]
  >;
  if (config.errors?.[errorKey]) {
    throw config.errors[errorKey];
  }

  return operation();
}

/**
 * Mock factory for ReferenceService with comprehensive testing capabilities
 */
export class ReferenceServiceMockFactory {
  /**
   * Create a mock ReferenceService with default successful responses
   */
  static create(
    config: ReferenceServiceMockConfig = {},
  ): jest.Mocked<ReferenceService> {
    const mockService: jest.Mocked<ReferenceService> = {
      validateReference: jest.fn(),
      trackDependencies: jest.fn(),
      detectCircularReferences: jest.fn(),
      enforceIntegrity: jest.fn(),
      resolveReferences: jest.fn(),
      batchResolveReferences: jest.fn(),
    };

    // Configure validateReference
    mockService.validateReference.mockImplementation(
      async (_request: ReferenceValidationRequest) => {
        return simulateOperation(
          () =>
            config.responses?.validateReference ||
            this.createSuccessfulValidation(),
          config,
          "validateReference",
        );
      },
    );

    // Configure trackDependencies
    mockService.trackDependencies.mockImplementation(
      async (entityId: string, entityType: string) => {
        return simulateOperation(
          () =>
            config.responses?.trackDependencies ||
            this.createDefaultDependencyGraph(entityId, entityType),
          config,
          "trackDependencies",
        );
      },
    );

    // Configure detectCircularReferences
    mockService.detectCircularReferences.mockImplementation(
      async (_entityId: string) => {
        return simulateOperation(
          () =>
            config.responses?.detectCircularReferences ||
            this.createNoCyclesResult(),
          config,
          "detectCircularReferences",
        );
      },
    );

    // Configure enforceIntegrity
    mockService.enforceIntegrity.mockImplementation(
      async (_entityId: string, _entityType: string) => {
        return simulateOperation(
          () =>
            config.responses?.enforceIntegrity ||
            this.createSuccessfulValidation(),
          config,
          "enforceIntegrity",
        );
      },
    );

    // Configure resolveReferences
    mockService.resolveReferences.mockImplementation(
      async (referenceIds: string[]) => {
        return simulateOperation(
          () =>
            config.responses?.resolveReferences ||
            this.createSuccessfulResolution(referenceIds, config),
          config,
          "resolveReferences",
        );
      },
    );

    // Configure batchResolveReferences
    mockService.batchResolveReferences.mockImplementation(
      async (requests: ReferenceValidationRequest[]) => {
        return simulateOperation(
          () =>
            config.responses?.batchResolveReferences ||
            this.createBatchResolution(requests, config),
          config,
          "batchResolveReferences",
        );
      },
    );

    return mockService;
  }

  /**
   * Create a mock that always succeeds with minimal data
   */
  static createSuccess(
    config: Partial<ReferenceServiceMockConfig> = {},
  ): jest.Mocked<ReferenceService> {
    return this.create({
      ...config,
      latency: 0,
      errors: {},
    });
  }

  /**
   * Create a mock that simulates validation failures
   */
  static createValidationFailure(
    operationName: keyof NonNullable<ReferenceServiceMockConfig["errors"]>,
    error: Error,
    config: Partial<ReferenceServiceMockConfig> = {},
  ): jest.Mocked<ReferenceService> {
    return this.create({
      ...config,
      errors: {
        ...config.errors,
        [operationName]: error,
      },
    });
  }

  /**
   * Create a mock that simulates cross-service failures
   */
  static createCrossServiceFailure(
    failureType: keyof NonNullable<
      ReferenceServiceMockConfig["crossServiceFailures"]
    >,
    config: Partial<ReferenceServiceMockConfig> = {},
  ): jest.Mocked<ReferenceService> {
    const errorMap = {
      serviceUnavailable: new Error("Reference service unavailable"),
      networkTimeout: new Error("Network timeout during cross-service call"),
      authenticationFailure: new Error(
        "Authentication failed for cross-service call",
      ),
      rateLimitExceeded: new Error("Rate limit exceeded for reference service"),
    };

    return this.create({
      ...config,
      crossServiceFailures: {
        ...config.crossServiceFailures,
        [failureType]: true,
      },
      errors: {
        validateReference: errorMap[failureType],
        trackDependencies: errorMap[failureType],
        detectCircularReferences: errorMap[failureType],
        enforceIntegrity: errorMap[failureType],
        resolveReferences: errorMap[failureType],
        batchResolveReferences: errorMap[failureType],
      },
    });
  }

  /**
   * Create a mock with circular reference detection
   */
  static createWithCircularReferences(
    cycles: string[][],
    config: Partial<ReferenceServiceMockConfig> = {},
  ): jest.Mocked<ReferenceService> {
    const affectedEntities = [...new Set(cycles.flat())];

    return this.create({
      ...config,
      responses: {
        ...config.responses,
        detectCircularReferences: {
          hasCircularReferences: true,
          cycles,
          affectedEntities,
        },
      },
    });
  }

  /**
   * Create a mock with performance simulation
   */
  static createWithPerformanceSimulation(
    performanceConfig: ReferenceServiceMockConfig["performance"],
    config: Partial<ReferenceServiceMockConfig> = {},
  ): jest.Mocked<ReferenceService> {
    return this.create({
      ...config,
      performance: {
        cacheHitRate: 0.8,
        avgCrossServiceLatency: 50,
        maxConcurrentResolve: 10,
        ...performanceConfig,
      },
      latency: performanceConfig?.avgCrossServiceLatency || 50,
    });
  }

  // Private helper methods for creating default responses

  private static createSuccessfulValidation(): ValidationResult {
    return {
      isValid: true,
      errors: [],
    };
  }

  private static createDefaultDependencyGraph(
    entityId: string,
    entityType: string,
  ): DependencyGraph {
    return {
      nodes: [
        {
          id: entityId,
          type: entityType,
          dependencies: [],
          dependents: [],
          metadata: {},
        },
      ],
      circularReferences: [],
      integrity: {
        isValid: true,
        violations: [],
      },
    };
  }

  private static createNoCyclesResult() {
    return {
      hasCircularReferences: false,
      cycles: [],
      affectedEntities: [],
    };
  }

  private static createSuccessfulResolution(
    referenceIds: string[],
    config: ReferenceServiceMockConfig,
  ): ReferenceResolutionResult {
    const cacheHitRate = config.performance?.cacheHitRate || 0.8;
    const avgLatency = config.performance?.avgCrossServiceLatency || 50;

    return {
      resolved: referenceIds.map((id) => ({
        referenceId: id,
        targetId: `target-${id}`,
        data: { id, type: "mock", data: {} },
        cached: Math.random() < cacheHitRate,
      })),
      failed: [],
      performance: {
        totalTime: avgLatency * (1 + Math.random() * 0.5), // +/- 25% variance
        cacheHits: Math.floor(referenceIds.length * cacheHitRate),
        crossServiceCalls: Math.ceil(referenceIds.length * (1 - cacheHitRate)),
      },
    };
  }

  private static createBatchResolution(
    requests: ReferenceValidationRequest[],
    config: ReferenceServiceMockConfig,
  ): ReferenceResolutionResult {
    const referenceIds = requests.map((req) => req.targetId);
    return this.createSuccessfulResolution(referenceIds, config);
  }
}
