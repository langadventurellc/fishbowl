/**
 * @fileoverview Builder for validation error scenarios
 */

import type { PersonalityCreationData } from "../../../types/personality";
import { PersonalityDataBuilder } from "./PersonalityDataBuilder";

/**
 * Builder for validation error scenarios
 */
export class ValidationErrorBuilder {
  private scenarios: Array<{
    name: string;
    data: Partial<PersonalityCreationData>;
    expectedErrors: string[];
  }> = [];

  /**
   * Add trait out of range error scenario
   */
  withTraitOutOfRange(): ValidationErrorBuilder {
    this.scenarios.push({
      name: "Trait value out of valid range",
      data: new PersonalityDataBuilder()
        .withOpenness(-10)
        .withConscientiousness(110)
        .build(),
      expectedErrors: [
        "openness must be between 0 and 100",
        "conscientiousness must be between 0 and 100",
      ],
    });
    return this;
  }

  /**
   * Add missing required fields error scenario
   */
  withMissingRequiredFields(): ValidationErrorBuilder {
    this.scenarios.push({
      name: "Missing required fields",
      data: {
        // Missing name and required traits
        description: "Invalid personality without required fields",
      },
      expectedErrors: [
        "name is required",
        "openness is required",
        "conscientiousness is required",
        "extraversion is required",
        "agreeableness is required",
        "neuroticism is required",
      ],
    });
    return this;
  }

  /**
   * Add invalid data types error scenario
   */
  withInvalidDataTypes(): ValidationErrorBuilder {
    this.scenarios.push({
      name: "Invalid data types",
      data: {
        name: 123, // Should be string
        openness: "high", // Should be number
        isTemplate: "yes", // Should be boolean
      } as unknown as PersonalityCreationData,
      expectedErrors: [
        "name must be a string",
        "openness must be a number",
        "isTemplate must be a boolean",
      ],
    });
    return this;
  }

  /**
   * Add name length validation error scenario
   */
  withInvalidNameLength(): ValidationErrorBuilder {
    this.scenarios.push({
      name: "Invalid name length",
      data: new PersonalityDataBuilder()
        .withName("") // Empty name
        .build(),
      expectedErrors: ["name must not be empty"],
    });
    return this;
  }

  /**
   * Build all error scenarios
   */
  buildAll(): Array<{
    name: string;
    data: Partial<PersonalityCreationData>;
    expectedErrors: string[];
  }> {
    return [...this.scenarios];
  }

  /**
   * Build specific error scenario by name
   */
  buildScenario(name: string):
    | {
        name: string;
        data: Partial<PersonalityCreationData>;
        expectedErrors: string[];
      }
    | undefined {
    return this.scenarios.find((scenario) => scenario.name === name);
  }
}
