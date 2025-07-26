import { BusinessRuleServiceMock } from "src/test-utils/personality-management/BusinessRuleServiceMock";
import { BusinessRuleServiceMockConfig } from "src/test-utils/personality-management/BusinessRuleServiceMockConfig";
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
    businessRule?: BusinessRuleServiceMockConfig;
    scoring?: ScoringServiceMockConfig;
    validation?: ValidationServiceMockConfig;
  }) {
    return {
      businessRuleService: new BusinessRuleServiceMock(config?.businessRule),
      scoringService: new ScoringServiceMock(config?.scoring),
      validationService: new ValidationServiceMock(config?.validation),
    };
  }

  /**
   * Create mocks configured for failure scenarios
   */
  static createFailingMocks() {
    return {
      businessRuleService: new BusinessRuleServiceMock({ shouldFail: true }),
      scoringService: new ScoringServiceMock({ shouldFail: true }),
      validationService: new ValidationServiceMock({ shouldFail: true }),
    };
  }

  /**
   * Create mocks configured for testing business logic only
   */
  static createBusinessLogicMocks() {
    return {
      businessRuleService: new BusinessRuleServiceMock(),
      scoringService: new ScoringServiceMock(),
      validationService: new ValidationServiceMock(),
    };
  }

  /**
   * Reset all mocks to default configuration
   */
  static resetMocks(mocks: {
    businessRuleService: BusinessRuleServiceMock;
    scoringService: ScoringServiceMock;
    validationService: ValidationServiceMock;
  }) {
    mocks.businessRuleService.reset();
    mocks.scoringService.reset();
    mocks.validationService.reset();
  }
}
