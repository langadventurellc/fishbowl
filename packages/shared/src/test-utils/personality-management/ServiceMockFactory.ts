import { ValidationServiceMock } from "src/test-utils/personality-management/ValidationServiceMock";
import { ValidationServiceMockConfig } from "src/test-utils/personality-management/ValidationServiceMockConfig";

/**
 * Factory for creating configured service mocks
 */

export class ServiceMockFactory {
  /**
   * Create a complete set of service mocks for testing
   */
  static createMockServices(config?: {
    validation?: ValidationServiceMockConfig;
  }) {
    return {
      validationService: new ValidationServiceMock(config?.validation),
    };
  }

  /**
   * Create mocks configured for failure scenarios
   */
  static createFailingMocks() {
    return {
      validationService: new ValidationServiceMock({ shouldFail: true }),
    };
  }

  /**
   * Create mocks configured for testing business logic only
   */
  static createBusinessLogicMocks() {
    return {
      validationService: new ValidationServiceMock(),
    };
  }

  /**
   * Reset all mocks to default configuration
   */
  static resetMocks(mocks: { validationService: ValidationServiceMock }) {
    mocks.validationService.reset();
  }
}
