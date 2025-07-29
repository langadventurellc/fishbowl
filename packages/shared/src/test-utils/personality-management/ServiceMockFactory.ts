import { ScoringServiceMock } from "src/test-utils/personality-management/ScoringServiceMock";
import { ScoringServiceMockConfig } from "src/test-utils/personality-management/ScoringServiceMockConfig";
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
    scoring?: ScoringServiceMockConfig;
    validation?: ValidationServiceMockConfig;
  }) {
    return {
      scoringService: new ScoringServiceMock(config?.scoring),
      validationService: new ValidationServiceMock(config?.validation),
    };
  }

  /**
   * Create mocks configured for failure scenarios
   */
  static createFailingMocks() {
    return {
      scoringService: new ScoringServiceMock({ shouldFail: true }),
      validationService: new ValidationServiceMock({ shouldFail: true }),
    };
  }

  /**
   * Create mocks configured for testing business logic only
   */
  static createBusinessLogicMocks() {
    return {
      scoringService: new ScoringServiceMock(),
      validationService: new ValidationServiceMock(),
    };
  }

  /**
   * Reset all mocks to default configuration
   */
  static resetMocks(mocks: {
    scoringService: ScoringServiceMock;
    validationService: ValidationServiceMock;
  }) {
    mocks.scoringService.reset();
    mocks.validationService.reset();
  }
}
