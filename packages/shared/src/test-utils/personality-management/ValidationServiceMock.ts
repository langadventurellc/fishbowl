import { ValidationServiceMockConfig } from "src/test-utils/personality-management/ValidationServiceMockConfig";
import type {
  PersonalityConfiguration,
  PersonalityCreationData,
} from "src/types/personality";

/**
 * Mock implementation of ValidationService for testing
 */

export class ValidationServiceMock {
  private config: ValidationServiceMockConfig;

  constructor(config: ValidationServiceMockConfig = {}) {
    this.config = {
      shouldFail: false,
      allowInvalidRanges: false,
      allowMissingTraits: false,
      statisticalThreshold: 0.05,
      ...config,
    };
  }

  /**
   * Validate personality trait ranges and completeness
   */
  async validatePersonality(
    personality: PersonalityConfiguration | PersonalityCreationData,
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    if (this.config.shouldFail) {
      throw new Error("ValidationService failed");
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required Big Five traits
    const requiredTraits = [
      "openness",
      "conscientiousness",
      "extraversion",
      "agreeableness",
      "neuroticism",
    ];

    for (const trait of requiredTraits) {
      const value = (personality as Record<string, unknown>)[trait];

      if (value === undefined || value === null) {
        if (!this.config.allowMissingTraits) {
          errors.push(`Missing required trait: ${trait}`);
        }
        continue;
      }

      if (typeof value !== "number") {
        errors.push(
          `Invalid type for ${trait}: expected number, got ${typeof value}`,
        );
        continue;
      }

      // Check valid range
      if (!this.config.allowInvalidRanges) {
        if (value < 0 || value > 100) {
          errors.push(`${trait} value ${value} outside valid range [0-100]`);
        }
      }

      // Check decimal precision
      const decimalPlaces = (value.toString().split(".")[1] || "").length;
      if (decimalPlaces > 2) {
        warnings.push(
          `${trait} has excessive decimal precision (${decimalPlaces} places, max 2)`,
        );
      }
    }

    // Statistical improbability check
    const traitValues = [
      personality.openness,
      personality.conscientiousness,
      personality.extraversion,
      personality.agreeableness,
      personality.neuroticism,
    ].filter((v) => v !== undefined);
    if (traitValues.length === 5) {
      const extremeCount = traitValues.filter((v) => v > 90 || v < 10).length;
      if (extremeCount >= 4) {
        warnings.push(
          "Statistical improbability: too many extreme trait values",
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Update mock configuration
   */
  updateConfig(newConfig: Partial<ValidationServiceMockConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset mock to default configuration
   */
  reset(): void {
    this.config = {
      shouldFail: false,
      allowInvalidRanges: false,
      allowMissingTraits: false,
      statisticalThreshold: 0.05,
    };
  }
}
