/**
 * @fileoverview Configuration Test Fixtures
 *
 * Provides valid and invalid configuration test data for file validation
 * integration tests, including personality configurations with various
 * validation scenarios.
 */

import { Buffer } from "buffer";
import type { PersonalityConfiguration } from "../../../types/personality";
import type { ConfigurationData } from "../utilities/TemporaryDirectoryManager";

/**
 * Test fixtures for creating valid and invalid configuration data
 */
export class ConfigurationTestFixtures {
  /**
   * Create a valid personality configuration for testing
   */
  static createValidPersonalityConfiguration(): PersonalityConfiguration {
    return {
      id: "test-personality-valid",
      name: "Valid Test Personality",
      description: "A valid personality configuration for testing",

      // Big Five traits (0-100)
      openness: 75,
      conscientiousness: 60,
      extraversion: 80,
      agreeableness: 70,
      neuroticism: 40,

      // Behavioral traits (0-100)
      formality: 50,
      humor: 60,
      assertiveness: 70,
      empathy: 80,
      storytelling: 40,
      brevity: 60,
      imagination: 75,
      playfulness: 50,
      dramaticism: 30,
      analyticalDepth: 80,
      contrarianism: 40,
      encouragement: 70,
      curiosity: 85,
      patience: 60,

      customInstructions: "Test custom instructions for personality override",
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Create an invalid personality configuration with missing required fields
   */
  static createInvalidPersonalityConfiguration(): Partial<PersonalityConfiguration> {
    return {
      id: "test-personality-invalid",
      // Missing name (required field)
      description: "Invalid personality missing required fields",

      // Out of range values
      openness: 150, // > 100
      conscientiousness: -10, // < 0
      extraversion: 80,
      agreeableness: 70,
      // Missing neuroticism (required)

      // Missing some behavioral traits
      formality: 50,
      humor: 60,
      // Missing other required behavioral traits

      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Create a personality configuration with multiple validation errors
   */
  static createMultipleErrorPersonalityConfiguration(): Partial<PersonalityConfiguration> {
    return {
      id: "test-personality-multiple-errors",
      // Missing name

      // Multiple out of range values
      openness: 200,
      conscientiousness: -50,
      extraversion: 999,
      agreeableness: -1,
      neuroticism: 150,

      // Invalid behavioral traits
      formality: -100,
      humor: 500,
      assertiveness: -25,
      empathy: 1000,

      // Missing required fields
      isTemplate: false,
      // Missing timestamps
    };
  }

  /**
   * Create a configuration data structure for file operations testing
   */
  static createValidConfigurationData(): ConfigurationData {
    const personality = this.createValidPersonalityConfiguration();
    return {
      version: "1.0.0",
      format: "json",
      encoding: "utf-8",
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "test-system",
        description: "Test configuration file",
        operation: "create",
      },
      data: {
        agents: [],
        personalities: [personality as unknown as Record<string, unknown>],
        roles: [],
      },
    };
  }

  /**
   * Create an invalid configuration data structure for testing validation failures
   */
  static createInvalidConfigurationData(): ConfigurationData {
    const invalidPersonality = this.createInvalidPersonalityConfiguration();
    return {
      version: "1.0.0",
      format: "json",
      encoding: "utf-8",
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "test-system",
        description: "Invalid test configuration file",
        operation: "create",
      },
      data: {
        agents: [],
        personalities: [
          invalidPersonality as unknown as Record<string, unknown>,
        ], // Force cast for testing
        roles: [],
      },
    };
  }

  /**
   * Create malformed JSON content for format validation testing
   */
  static createMalformedJsonContent(): string {
    return `{
      "version": "1.0.0",
      "format": "json",
      "encoding": "utf-8",
      "metadata": {
        "createdAt": "${new Date().toISOString()}",
        "createdBy": "test-system",
        "description": "Malformed JSON for testing"
        // Missing comma and closing brace
      "data": {
        "personalities": [
          {
            "id": "test-personality",
            "name": "Test" // Missing closing quote
          }
        ]
      }
    `; // Missing closing brace
  }

  /**
   * Create valid JSON with invalid schema content
   */
  static createInvalidSchemaContent(): string {
    return JSON.stringify(
      {
        version: "1.0.0",
        format: "json",
        encoding: "utf-8",
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: "test-system",
          description: "Valid JSON but invalid schema",
        },
        data: {
          personalities: [
            {
              id: "test-personality",
              // Missing required name field
              invalidField: "This field shouldn't exist",
              openness: "not-a-number", // Should be number
              conscientiousness: 150, // Out of range
            },
          ],
        },
      },
      null,
      2,
    );
  }

  /**
   * Create partially valid configuration for transaction testing
   */
  static createPartiallyValidConfiguration(): ConfigurationData {
    return {
      version: "1.0.0",
      format: "json",
      encoding: "utf-8",
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "test-system",
        description: "Partially valid configuration for transaction testing",
        operation: "update",
      },
      data: {
        agents: [],
        personalities: [
          this.createValidPersonalityConfiguration() as unknown as Record<
            string,
            unknown
          >,
          this.createInvalidPersonalityConfiguration() as unknown as Record<
            string,
            unknown
          >, // One valid, one invalid
        ],
        roles: [],
      },
    };
  }

  /**
   * Create configuration with encoding issues for testing
   */
  static createEncodingIssueContent(): Buffer {
    const validConfig = this.createValidConfigurationData();
    const jsonString = JSON.stringify(validConfig, null, 2);

    // Create content with mixed encoding (UTF-8 with some invalid bytes)
    const utf8Buffer = Buffer.from(jsonString, "utf8");
    const corruptedBuffer = Buffer.alloc(utf8Buffer.length + 10);
    utf8Buffer.copy(corruptedBuffer);

    // Insert some invalid UTF-8 bytes
    corruptedBuffer[utf8Buffer.length] = 0xff;
    corruptedBuffer[utf8Buffer.length + 1] = 0xfe;

    return corruptedBuffer;
  }

  /**
   * Create a complete valid configuration for end-to-end testing
   */
  static createCompleteValidConfiguration(): ConfigurationData {
    return {
      version: "1.0.0",
      format: "json",
      encoding: "utf-8",
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "test-system",
        lastModified: new Date().toISOString(),
        description: "Complete valid configuration for comprehensive testing",
        operation: "create",
      },
      data: {
        agents: [],
        personalities: [
          this.createValidPersonalityConfiguration() as unknown as Record<
            string,
            unknown
          >,
          {
            ...this.createValidPersonalityConfiguration(),
            id: "test-personality-2",
            name: "Second Valid Personality",
            description: "Another valid personality for testing",
          } as unknown as Record<string, unknown>,
        ],
        roles: [],
      },
    };
  }
}
