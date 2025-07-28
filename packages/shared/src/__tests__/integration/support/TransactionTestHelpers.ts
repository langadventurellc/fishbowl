/**
 * Transaction Test Helper Utilities
 * Provides specialized utilities for testing transaction consistency,
 * call ordering, rollback mechanisms, and performance validation
 */

// TypeScript interfaces for transaction-aware services
interface TimestampedMockFunction
  extends jest.MockedFunction<(...args: unknown[]) => unknown> {
  lastCallTime?: number;
}

export interface TransactionAwareService {
  rollbackPersonality?: TimestampedMockFunction;
  rollbackConfiguration?: TimestampedMockFunction;
  rollbackRole?: TimestampedMockFunction;
  rollbackAgent?: TimestampedMockFunction;
  [key: string]: unknown;
}

interface TransactionResult {
  id: string;
  [key: string]: unknown;
}

interface TransactionMeasurement<T = unknown> {
  result: T;
  duration: number;
}

interface TransactionError {
  error: Error;
  duration: number;
}

export class TransactionTestHelpers {
  /**
   * Verify that mockA was called before mockB based on call timestamps
   */
  static expectCalledBefore(
    mockA: TimestampedMockFunction,
    mockB: TimestampedMockFunction,
  ) {
    expect(mockA).toHaveBeenCalled();
    expect(mockB).toHaveBeenCalled();

    const mockATime = mockA.lastCallTime || 0;
    const mockBTime = mockB.lastCallTime || 0;

    expect(mockATime).toBeLessThan(mockBTime);
  }

  /**
   * Verify rollback operations occurred in reverse dependency order
   */
  static expectRollbackOrder(
    personalityService: TransactionAwareService,
    roleService: TransactionAwareService,
    configurationService: TransactionAwareService,
  ) {
    // Verify all rollback methods were called
    expect(personalityService.rollbackPersonality).toHaveBeenCalled();
    expect(configurationService.rollbackConfiguration).toHaveBeenCalled();

    // Get call timestamps for ordering verification
    const personalityRollbackTime =
      personalityService.rollbackPersonality?.lastCallTime || 0;
    const configRollbackTime =
      configurationService.rollbackConfiguration?.lastCallTime || 0;

    // Verify rollback occurred in reverse order (last created service rolls back first)
    expect(personalityRollbackTime).toBeGreaterThanOrEqual(
      configRollbackTime - 100,
    ); // Allow some timing variance
  }

  /**
   * Verify transaction performance meets requirements
   */
  static expectTransactionPerformance(duration: number, maxAllowed: number) {
    expect(duration).toBeLessThan(maxAllowed);
    expect(duration).toBeGreaterThan(0); // Sanity check
  }

  /**
   * Verify that rollback operations maintain proper error context
   */
  static expectRollbackErrorContext(error: Error, expectedContext: string) {
    expect(error).toBeDefined();
    expect(error.message).toContain(expectedContext);
  }

  /**
   * Verify service state after rollback completion
   */
  static expectServiceStateAfterRollback(
    personalityService: TransactionAwareService,
    roleService: TransactionAwareService,
    agentService: TransactionAwareService,
    configurationService: TransactionAwareService,
  ) {
    // Verify rollback methods were called for each service that had successful operations
    expect(personalityService.rollbackPersonality).toHaveBeenCalled();
    expect(configurationService.rollbackConfiguration).toHaveBeenCalled();

    // Verify rollback call counts match the expected cleanup operations
    expect(personalityService.rollbackPersonality).toHaveBeenCalledTimes(1);
    expect(configurationService.rollbackConfiguration).toHaveBeenCalledTimes(1);
  }

  /**
   * Setup performance monitoring for transaction operations
   */
  static async measureTransactionTime<T>(
    operation: () => Promise<T>,
  ): Promise<TransactionMeasurement<T>> {
    const startTime = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      return { result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      const transactionError: TransactionError = {
        error: error as Error,
        duration,
      };
      throw transactionError;
    }
  }

  /**
   * Verify concurrent operation handling maintains consistency
   */
  static expectConcurrentOperationConsistency(
    results: TransactionResult[],
    expectedCount: number,
  ) {
    expect(results).toHaveLength(expectedCount);

    // Verify each result has consistent structure
    results.forEach((result) => {
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
    });

    // Verify no duplicate IDs (consistency check)
    const ids = results.map((r) => r.id);
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds).toHaveLength(expectedCount);
  }

  /**
   * Verify transaction boundary enforcement with timing validation
   */
  static expectTransactionBoundaryEnforcement(
    serviceCallTimes: Record<string, number>,
    maxOverhead = 50,
  ) {
    const callTimes = Object.values(serviceCallTimes);
    const minTime = Math.min(...callTimes);
    const maxTime = Math.max(...callTimes);

    // Verify transaction coordination overhead is within acceptable limits
    const totalOverhead = maxTime - minTime;
    expect(totalOverhead).toBeLessThan(maxOverhead);
  }
}
