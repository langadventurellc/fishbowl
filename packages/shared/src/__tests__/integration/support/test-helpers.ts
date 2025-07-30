/**
 * @fileoverview Test Helpers and Utilities for Personality Management
 *
 * Provides specialized utilities for personality testing including concurrency
 * helpers, assertion utilities, and test coordination functions.
 */

import type {
  PersonalityConfiguration,
  PersonalityCreationData,
} from "../../../types/personality";

/**
 * Configuration for concurrency testing
 */
interface ConcurrencyTestConfig {
  concurrentOperations: number;
  operationDelay?: number;
  expectAllSuccess?: boolean;
  expectSomeFailures?: boolean;
}

/**
 * Result from concurrency testing
 */
interface ConcurrencyTestResult<T> {
  results: Array<{ success: boolean; data?: T; error?: Error }>;
  successCount: number;
  failureCount: number;
  totalDuration: number;
  averageDuration: number;
}

/**
 * Helper for testing concurrent personality operations
 */
export class ConcurrencyTestHelper {
  /**
   * Test concurrent personality creation operations
   */
  static async testConcurrentCreation(
    createFunction: (
      data: PersonalityCreationData,
    ) => Promise<PersonalityConfiguration>,
    testData: PersonalityCreationData[],
    config: ConcurrencyTestConfig,
  ): Promise<ConcurrencyTestResult<PersonalityConfiguration>> {
    const startTime = Date.now();
    const operations = [];

    for (let i = 0; i < config.concurrentOperations; i++) {
      const dataIndex = i % testData.length;
      const baseData = testData[dataIndex];
      if (!baseData) {
        throw new Error(`No test data available at index ${dataIndex}`);
      }
      const personalityData = { ...baseData, name: `${baseData.name}-${i}` };

      const operation = async () => {
        if (config.operationDelay) {
          await new Promise((resolve) =>
            globalThis.setTimeout(resolve, config.operationDelay),
          );
        }
        return createFunction(personalityData);
      };

      operations.push(operation());
    }

    const settledResults = await Promise.allSettled(operations);
    const endTime = Date.now();

    const results = settledResults.map((result) => {
      if (result.status === "fulfilled") {
        return { success: true, data: result.value };
      } else {
        return { success: false, error: result.reason };
      }
    });

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;
    const totalDuration = endTime - startTime;

    return {
      results,
      successCount,
      failureCount,
      totalDuration,
      averageDuration: totalDuration / config.concurrentOperations,
    };
  }

  /**
   * Test concurrent personality update operations
   */
  static async testConcurrentUpdates(
    updateFunction: (
      id: string,
      data: Partial<PersonalityCreationData>,
    ) => Promise<PersonalityConfiguration>,
    personalityIds: string[],
    updateData: Partial<PersonalityCreationData>,
    config: ConcurrencyTestConfig,
  ): Promise<ConcurrencyTestResult<PersonalityConfiguration>> {
    const startTime = Date.now();
    const operations = [];

    for (let i = 0; i < config.concurrentOperations; i++) {
      const idIndex = i % personalityIds.length;
      const id = personalityIds[idIndex];
      if (!id) {
        throw new Error(`No personality ID available at index ${idIndex}`);
      }

      const operation = async () => {
        if (config.operationDelay) {
          await new Promise((resolve) =>
            globalThis.setTimeout(resolve, config.operationDelay),
          );
        }
        return updateFunction(id, {
          ...updateData,
          name: `Updated-${i}`,
        } as Partial<PersonalityCreationData>);
      };

      operations.push(operation());
    }

    const settledResults = await Promise.allSettled(operations);
    const endTime = Date.now();

    const results = settledResults.map((result) => {
      if (result.status === "fulfilled") {
        return { success: true, data: result.value };
      } else {
        return { success: false, error: result.reason };
      }
    });

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;
    const totalDuration = endTime - startTime;

    return {
      results,
      successCount,
      failureCount,
      totalDuration,
      averageDuration: totalDuration / config.concurrentOperations,
    };
  }

  /**
   * Validate concurrency test results
   */
  static validateConcurrencyResults<T>(
    results: ConcurrencyTestResult<T>,
    config: ConcurrencyTestConfig,
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (config.expectAllSuccess && results.failureCount > 0) {
      issues.push(
        `Expected all operations to succeed, but ${results.failureCount} failed`,
      );
    }

    if (config.expectSomeFailures && results.failureCount === 0) {
      issues.push("Expected some operations to fail, but all succeeded");
    }

    if (results.results.length !== config.concurrentOperations) {
      issues.push(
        `Expected ${config.concurrentOperations} results, got ${results.results.length}`,
      );
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

/**
 * Assertion utilities for personality testing
 */
export class PersonalityAssertions {
  /**
   * Assert that two personalities have the same trait values
   */
  static assertTraitsEqual(
    actual: PersonalityConfiguration,
    expected: PersonalityConfiguration,
    tolerance = 0,
  ): void {
    const traitNames = [
      "openness",
      "conscientiousness",
      "extraversion",
      "agreeableness",
      "neuroticism",
      "formality",
      "humor",
      "assertiveness",
      "empathy",
      "storytelling",
      "brevity",
      "imagination",
      "playfulness",
      "dramaticism",
      "analyticalDepth",
      "contrarianism",
      "encouragement",
      "curiosity",
      "patience",
    ];

    for (const trait of traitNames) {
      const actualValue = (actual as unknown as Record<string, number>)[trait];
      const expectedValue = (expected as unknown as Record<string, number>)[
        trait
      ];

      if (
        actualValue !== undefined &&
        expectedValue !== undefined &&
        Math.abs(actualValue - expectedValue) > tolerance
      ) {
        throw new Error(
          `Trait ${trait} mismatch: expected ${expectedValue}, got ${actualValue} (tolerance: ${tolerance})`,
        );
      }
    }
  }

  /**
   * Assert that personality has valid metadata
   */
  static assertValidMetadata(personality: PersonalityConfiguration): void {
    if (!personality.id || typeof personality.id !== "string") {
      throw new Error("Personality must have a valid string ID");
    }

    if (
      !personality.name ||
      typeof personality.name !== "string" ||
      personality.name.trim() === ""
    ) {
      throw new Error("Personality must have a non-empty name");
    }

    if (typeof personality.isTemplate !== "boolean") {
      throw new Error("isTemplate must be a boolean");
    }

    const createdAt = new Date(personality.createdAt);
    if (isNaN(createdAt.getTime())) {
      throw new Error("createdAt must be a valid ISO timestamp");
    }

    const updatedAt = new Date(personality.updatedAt);
    if (isNaN(updatedAt.getTime())) {
      throw new Error("updatedAt must be a valid ISO timestamp");
    }

    if (updatedAt < createdAt) {
      throw new Error("updatedAt cannot be before createdAt");
    }
  }

  /**
   * Assert that personality is a valid template
   */
  static assertValidTemplate(personality: PersonalityConfiguration): void {
    this.assertValidMetadata(personality);

    if (!personality.isTemplate) {
      throw new Error("Expected personality to be marked as template");
    }

    if (!personality.description || personality.description.trim() === "") {
      throw new Error("Template personalities should have descriptions");
    }
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestHelper {
  /**
   * Measure execution time of an operation
   */
  static async measureExecutionTime<T>(
    operation: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    const startTime = globalThis.performance.now();
    const result = await operation();
    const endTime = globalThis.performance.now();

    return {
      result,
      duration: endTime - startTime,
    };
  }

  /**
   * Run performance benchmark with multiple iterations
   */
  static async benchmark<T>(
    operation: () => Promise<T>,
    iterations = 10,
  ): Promise<{
    results: T[];
    durations: number[];
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    totalDuration: number;
  }> {
    const results: T[] = [];
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await this.measureExecutionTime(operation);
      results.push(result);
      durations.push(duration);
    }

    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / iterations;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      results,
      durations,
      averageDuration,
      minDuration,
      maxDuration,
      totalDuration,
    };
  }
}

/**
 * Test state management utilities
 */
export class TestStateManager {
  private static state: Map<string, unknown> = new Map();

  /**
   * Set test state value
   */
  static set<T>(key: string, value: T): void {
    this.state.set(key, value);
  }

  /**
   * Get test state value
   */
  static get<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  /**
   * Check if test state has key
   */
  static has(key: string): boolean {
    return this.state.has(key);
  }

  /**
   * Clear specific test state
   */
  static clear(key: string): void {
    this.state.delete(key);
  }

  /**
   * Clear all test state
   */
  static clearAll(): void {
    this.state.clear();
  }

  /**
   * Get all state keys
   */
  static getKeys(): string[] {
    return Array.from(this.state.keys());
  }
}

/**
 * Error simulation utilities
 */
export class ErrorSimulator {
  /**
   * Create a function that fails after N successful calls
   */
  static createFailAfterN<T extends (...args: unknown[]) => unknown>(
    originalFunction: T,
    successCount: number,
    errorToThrow: Error = new Error("Simulated failure"),
  ): T & { reset: () => void; getCallCount: () => number } {
    let callCount = 0;

    const wrapper = ((...args: Parameters<T>) => {
      callCount++;
      if (callCount > successCount) {
        throw errorToThrow;
      }
      return originalFunction(...args);
    }) as T & { reset: () => void; getCallCount: () => number };

    wrapper.reset = () => {
      callCount = 0;
    };

    wrapper.getCallCount = () => callCount;

    return wrapper;
  }

  /**
   * Create a function that randomly fails
   */
  static createRandomFailure<T extends (...args: unknown[]) => unknown>(
    originalFunction: T,
    failureRate: number, // 0.0 to 1.0
    errorToThrow: Error = new Error("Random failure"),
  ): T {
    return ((...args: Parameters<T>) => {
      if (Math.random() < failureRate) {
        throw errorToThrow;
      }
      return originalFunction(...args);
    }) as T;
  }
}
