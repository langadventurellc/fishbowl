/**
 * @fileoverview Base Setup for Personality Business Logic Integration Tests
 *
 * Provides common setup and teardown utilities for personality business logic tests
 * including service mock configuration and test environment initialization.
 */

import { ServiceMockFactory } from "./ServiceMockFactory";

/**
 * Base test setup for personality business logic integration tests
 */
export class PersonalityBusinessLogicTestSetup {
  /**
   * Set up test environment for personality business logic tests
   */
  static setupTestEnvironment() {
    // Create standard service mocks
    const serviceMocks = ServiceMockFactory.createMockServices();

    // Configure test environment
    const testConfig = {
      enableBusinessRuleValidation: true,
      enableScoringCalculation: true,
      enableTraitValidation: true,
      mockExternalDependencies: true,
    };

    return {
      serviceMocks,
      testConfig,
    };
  }

  /**
   * Tear down test environment and reset mocks
   */
  static teardownTestEnvironment(
    serviceMocks: ReturnType<typeof ServiceMockFactory.createMockServices>,
  ) {
    // Reset all service mocks to default state
    ServiceMockFactory.resetMocks(serviceMocks);
  }

  /**
   * Create test setup for failure scenarios
   */
  static setupFailureTestEnvironment() {
    const serviceMocks = ServiceMockFactory.createFailingMocks();

    const testConfig = {
      enableBusinessRuleValidation: true,
      enableScoringCalculation: true,
      enableTraitValidation: true,
      mockExternalDependencies: true,
      expectFailures: true,
    };

    return {
      serviceMocks,
      testConfig,
    };
  }

  /**
   * Set up test environment for business logic only (simplified)
   */
  static setupBusinessLogicTestEnvironment() {
    const serviceMocks = ServiceMockFactory.createBusinessLogicMocks();

    const testConfig = {
      enableBusinessRuleValidation: true,
      enableScoringCalculation: true,
      enableTraitValidation: true,
      mockExternalDependencies: true,
      businessLogicFocus: true,
    };

    return {
      serviceMocks,
      testConfig,
    };
  }
}
