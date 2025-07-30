/**
 * @fileoverview Fixture Validation Utilities
 *
 * Comprehensive utilities for validating test fixtures and generating
 * realistic test data for configuration service file operations testing.
 */

import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Validation result for fixture integrity checks
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ValidationSummary;
}

/**
 * Individual validation error
 */
export interface ValidationError {
  path: string;
  field?: string;
  code: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Individual validation warning
 */
export interface ValidationWarning {
  path: string;
  field?: string;
  code: string;
  message: string;
  suggestion?: string;
}

/**
 * Validation summary statistics
 */
export interface ValidationSummary {
  totalFixtures: number;
  validFixtures: number;
  invalidFixtures: number;
  errorCount: number;
  warningCount: number;
  validationDuration: number;
}

/**
 * Entity counts for performance test data generation
 */
export interface EntityCounts {
  agents: number;
  personalities: number;
  roles: number;
  models: number;
}

/**
 * Agent entity for fixtures
 */
export interface FixtureAgent {
  id: string;
  name: string;
  description?: string;
  role: string;
  personalityId: string;
  modelId: string;
  capabilities: string[];
  constraints: string[];
  settings: Record<string, unknown>;
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    tags: string[];
  };
}

/**
 * Personality entity for fixtures
 */
export interface FixturePersonality {
  id: string;
  name: string;
  description?: string;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  formality: number;
  humor: number;
  assertiveness: number;
  empathy: number;
  storytelling: number;
  brevity: number;
  imagination: number;
  playfulness: number;
  dramaticism: number;
  analyticalDepth: number;
  contrarianism: number;
  encouragement: number;
  curiosity: number;
  patience: number;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Role entity for fixtures
 */
export interface FixtureRole {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  constraints: string[];
  isTemplate: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

/**
 * Model entity for fixtures
 */
export interface FixtureModel {
  id: string;
  name: string;
  provider: string;
  version: string;
  description?: string;
  tier: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Configuration data structure for fixtures
 */
export interface ConfigurationData {
  version: string;
  format: string;
  encoding: string;
  metadata: {
    createdAt: string;
    createdBy: string;
    lastModified: string;
    description?: string;
    [key: string]: unknown;
  };
  data: {
    agents: FixtureAgent[];
    personalities: FixturePersonality[];
    roles: FixtureRole[];
    models?: FixtureModel[];
  };
}

/**
 * Fixture validation utilities for comprehensive testing
 */
export class FixtureValidationUtils {
  private static readonly CURRENT_SCHEMA_VERSION = "1.0.0";
  private static readonly SUPPORTED_FORMATS = ["json"];
  private static readonly SUPPORTED_ENCODINGS = ["utf8", "utf-8"];

  /**
   * Validates fixture file integrity against schemas and business rules
   * @param fixturePath Path to the fixture file
   * @returns Validation result with errors and warnings
   */
  static async validateFixtureIntegrity(
    fixturePath: string,
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Read and parse fixture file
      const fileContent = await readFile(fixturePath, "utf-8");
      let fixtureData: unknown;

      try {
        fixtureData = JSON.parse(fileContent);
      } catch (parseError) {
        errors.push({
          path: fixturePath,
          code: "INVALID_JSON",
          message: `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          severity: "error",
        });

        return this.createValidationResult(
          errors,
          warnings,
          0,
          0,
          Date.now() - startTime,
        );
      }

      // Type guard to ensure fixtureData is a record
      if (typeof fixtureData !== "object" || fixtureData === null) {
        errors.push({
          path: fixturePath,
          code: "INVALID_FIXTURE_TYPE",
          message: "Fixture data must be an object",
          severity: "error",
        });
        return this.createValidationResult(
          errors,
          warnings,
          0,
          0,
          Date.now() - startTime,
        );
      }

      const fixtureRecord = fixtureData as Record<string, unknown>;

      // Validate fixture structure
      const structureValidation = this.validateFixtureStructure(
        fixtureRecord,
        fixturePath,
      );
      errors.push(...structureValidation.errors);
      warnings.push(...structureValidation.warnings);

      // Validate individual configurations
      let validCount = 0;
      let totalCount = 0;

      if (
        fixtureRecord.validConfigurations &&
        typeof fixtureRecord.validConfigurations === "object"
      ) {
        for (const [configName, config] of Object.entries(
          fixtureRecord.validConfigurations as Record<string, unknown>,
        )) {
          totalCount++;
          const configPath = `${fixturePath}:validConfigurations.${configName}`;
          const configValidation = await this.validateConfiguration(
            config as ConfigurationData,
            configPath,
          );

          if (configValidation.isValid) {
            validCount++;
          } else {
            errors.push(...configValidation.errors);
            warnings.push(...configValidation.warnings);
          }
        }
      }

      if (
        fixtureRecord.invalidConfigurations &&
        typeof fixtureRecord.invalidConfigurations === "object"
      ) {
        for (const [configName, config] of Object.entries(
          fixtureRecord.invalidConfigurations as Record<string, unknown>,
        )) {
          totalCount++;
          const configPath = `${fixturePath}:invalidConfigurations.${configName}`;

          // For invalid configurations, we expect validation to fail
          // We just check that they have the expected structure
          const hasExpectedInvalidStructure =
            this.validateInvalidConfigurationStructure(config, configPath);
          if (hasExpectedInvalidStructure) {
            validCount++;
          }
        }
      }

      return this.createValidationResult(
        errors,
        warnings,
        validCount,
        totalCount,
        Date.now() - startTime,
      );
    } catch (error) {
      errors.push({
        path: fixturePath,
        code: "FILE_READ_ERROR",
        message: `Failed to read fixture file: ${error instanceof Error ? error.message : String(error)}`,
        severity: "error",
      });

      return this.createValidationResult(
        errors,
        warnings,
        0,
        0,
        Date.now() - startTime,
      );
    }
  }

  /**
   * Generates performance test data with specified entity counts
   * @param entityCounts Number of each entity type to generate
   * @returns Complete configuration data for performance testing
   */
  static generatePerformanceTestData(
    entityCounts: EntityCounts,
  ): ConfigurationData {
    const timestamp = new Date().toISOString();

    return {
      version: this.CURRENT_SCHEMA_VERSION,
      format: "json",
      encoding: "utf8",
      metadata: {
        createdAt: timestamp,
        createdBy: "fixture-validation-utils",
        lastModified: timestamp,
        description: `Generated performance test data with ${entityCounts.agents} agents, ${entityCounts.personalities} personalities, ${entityCounts.roles} roles, ${entityCounts.models} models`,
        entityCounts,
        generatedAt: timestamp,
      },
      data: {
        models: this.generateModels(entityCounts.models),
        personalities: this.generatePersonalities(entityCounts.personalities),
        roles: this.generateRoles(entityCounts.roles),
        agents: this.generateAgents(
          entityCounts.agents,
          entityCounts.personalities,
          entityCounts.roles,
          entityCounts.models,
        ),
      },
    };
  }

  /**
   * Creates a realistic agent configuration with proper UUIDs and references
   * @param index Agent index for unique generation
   * @param personalityCount Number of available personalities to reference
   * @param roleCount Number of available roles to reference
   * @param modelCount Number of available models to reference
   * @returns Generated agent configuration
   */
  static createRealisticAgent(
    index: number,
    personalityCount: number,
    roleCount: number,
    modelCount: number,
  ): FixtureAgent {
    const uuid = this.generateUUID();
    const timestamp = new Date(Date.now() + index * 1000).toISOString();

    // Create deterministic but varied references
    const personalityIndex = index % personalityCount;
    const roleIndex = index % roleCount;
    const modelIndex = index % modelCount;

    return {
      id: uuid,
      name: `Performance Test Agent ${index + 1}`,
      description: `Generated agent ${index + 1} for comprehensive performance testing`,
      role: `performance-test-role-${roleIndex + 1}`,
      personalityId: this.generateDeterministicUUID(personalityIndex),
      modelId: `perf-model-${modelIndex + 1}`,
      capabilities: this.generateCapabilities(index),
      constraints: this.generateConstraints(index),
      settings: {
        maxResponseTime: `${Math.min(5000 + index * 10, 30000)}ms`,
        memoryLimit: `${Math.min(256 + index * 2, 1024)}MB`,
        retryAttempts: Math.min(3 + (index % 5), 10),
        priority: index % 3 === 0 ? "high" : index % 2 === 0 ? "medium" : "low",
      },
      metadata: {
        version: "1.0",
        createdAt: timestamp,
        updatedAt: timestamp,
        isActive: true,
        tags: [
          "performance",
          "generated",
          `batch-${Math.floor(index / 100)}`,
          `priority-${index % 3 === 0 ? "high" : index % 2 === 0 ? "medium" : "low"}`,
        ],
      },
    };
  }

  /**
   * Validates that all fixture schemas are current and complete
   * @param fixtureDirectory Directory containing fixture files
   * @returns Comprehensive validation report
   */
  static async validateAllFixtures(
    fixtureDirectory: string,
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const fixtureFiles = [
      "valid-configuration-files.json",
      "invalid-configuration-files.json",
      "file-operation-scenarios.json",
    ];

    let totalValid = 0;
    let totalCount = 0;

    for (const filename of fixtureFiles) {
      const filePath = join(fixtureDirectory, filename);
      const result = await this.validateFixtureIntegrity(filePath);

      errors.push(...result.errors);
      warnings.push(...result.warnings);
      totalValid += result.summary.validFixtures;
      totalCount += result.summary.totalFixtures;
    }

    return this.createValidationResult(
      errors,
      warnings,
      totalValid,
      totalCount,
      Date.now() - startTime,
    );
  }

  // Private helper methods

  private static validateFixtureStructure(
    fixtureData: Record<string, unknown>,
    fixturePath: string,
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check required top-level properties
    if (!fixtureData.description) {
      warnings.push({
        path: fixturePath,
        field: "description",
        code: "MISSING_DESCRIPTION",
        message: "Fixture file should have a description field",
        suggestion:
          "Add a description explaining the purpose of this fixture file",
      });
    }

    // Validate that we have at least one configuration section
    const hasSections =
      fixtureData.validConfigurations ||
      fixtureData.invalidConfigurations ||
      fixtureData.atomicOperationScenarios ||
      fixtureData.corruptedFiles;

    if (!hasSections) {
      errors.push({
        path: fixturePath,
        code: "NO_FIXTURE_SECTIONS",
        message: "Fixture file must contain at least one configuration section",
        severity: "error",
      });
    }

    return { errors, warnings };
  }

  private static async validateConfiguration(
    config: ConfigurationData,
    configPath: string,
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate basic structure
    if (!config.version) {
      errors.push({
        path: configPath,
        field: "version",
        code: "MISSING_VERSION",
        message: "Configuration must have a version field",
        severity: "error",
      });
    } else if (config.version !== this.CURRENT_SCHEMA_VERSION) {
      warnings.push({
        path: configPath,
        field: "version",
        code: "VERSION_MISMATCH",
        message: `Configuration version ${config.version} does not match current schema version ${this.CURRENT_SCHEMA_VERSION}`,
        suggestion: `Update version to ${this.CURRENT_SCHEMA_VERSION}`,
      });
    }

    if (!config.format || !this.SUPPORTED_FORMATS.includes(config.format)) {
      errors.push({
        path: configPath,
        field: "format",
        code: "INVALID_FORMAT",
        message: `Configuration format must be one of: ${this.SUPPORTED_FORMATS.join(", ")}`,
        severity: "error",
      });
    }

    if (
      !config.encoding ||
      !this.SUPPORTED_ENCODINGS.includes(config.encoding)
    ) {
      errors.push({
        path: configPath,
        field: "encoding",
        code: "INVALID_ENCODING",
        message: `Configuration encoding must be one of: ${this.SUPPORTED_ENCODINGS.join(", ")}`,
        severity: "error",
      });
    }

    // Validate data section
    if (!config.data) {
      errors.push({
        path: configPath,
        field: "data",
        code: "MISSING_DATA",
        message: "Configuration must have a data section",
        severity: "error",
      });
    } else {
      // Validate arrays
      const dataKeys = ["agents", "personalities", "roles"] as const;
      for (const arrayName of dataKeys) {
        const arrayValue = (config.data as Record<string, unknown>)[arrayName];
        if (arrayValue && !Array.isArray(arrayValue)) {
          errors.push({
            path: configPath,
            field: `data.${arrayName}`,
            code: "INVALID_ARRAY",
            message: `data.${arrayName} must be an array`,
            severity: "error",
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalFixtures: 1,
        validFixtures: errors.length === 0 ? 1 : 0,
        invalidFixtures: errors.length > 0 ? 1 : 0,
        errorCount: errors.length,
        warningCount: warnings.length,
        validationDuration: 0,
      },
    };
  }

  private static validateInvalidConfigurationStructure(
    config: unknown,
    _configPath: string,
  ): boolean {
    // For invalid configurations, we just check that they exist and aren't null/undefined
    // The point is that they should fail validation when used
    return config !== null && config !== undefined;
  }

  private static createValidationResult(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    validCount: number,
    totalCount: number,
    duration: number,
  ): ValidationResult {
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalFixtures: totalCount,
        validFixtures: validCount,
        invalidFixtures: totalCount - validCount,
        errorCount: errors.length,
        warningCount: warnings.length,
        validationDuration: duration,
      },
    };
  }

  private static generateModels(count: number): FixtureModel[] {
    const models: FixtureModel[] = [];
    const providers = ["openai", "anthropic", "google", "microsoft"] as const;
    const tiers = ["basic", "standard", "premium", "enterprise"] as const;

    for (let i = 0; i < count; i++) {
      const provider = providers[i % providers.length]!;
      const tier = tiers[i % tiers.length]!;

      models.push({
        id: `perf-model-${i + 1}`,
        name: `Performance Test Model ${i + 1}`,
        provider,
        version: `v${Math.floor(i / 10) + 1}.${i % 10}`,
        description: `Generated model ${i + 1} for performance testing`,
        tier,
        isAvailable: i % 10 !== 9, // Make 10% unavailable
        createdAt: new Date(Date.now() - (count - i) * 1000).toISOString(),
        updatedAt: new Date(Date.now() - (count - i) * 500).toISOString(),
      });
    }

    return models;
  }

  private static generatePersonalities(count: number): FixturePersonality[] {
    const personalities = [];

    for (let i = 0; i < count; i++) {
      const uuid = this.generateDeterministicUUID(i);
      const timestamp = new Date(Date.now() - (count - i) * 1000).toISOString();

      personalities.push({
        id: uuid,
        name: `Performance Test Personality ${i + 1}`,
        description: `Generated personality ${i + 1} for performance testing with varied traits`,
        // Generate varied but deterministic Big Five traits
        openness: this.generateTraitValue(i, 0),
        conscientiousness: this.generateTraitValue(i, 1),
        extraversion: this.generateTraitValue(i, 2),
        agreeableness: this.generateTraitValue(i, 3),
        neuroticism: this.generateTraitValue(i, 4),
        // Generate varied behavioral traits
        formality: this.generateTraitValue(i, 5),
        humor: this.generateTraitValue(i, 6),
        assertiveness: this.generateTraitValue(i, 7),
        empathy: this.generateTraitValue(i, 8),
        storytelling: this.generateTraitValue(i, 9),
        brevity: this.generateTraitValue(i, 10),
        imagination: this.generateTraitValue(i, 11),
        playfulness: this.generateTraitValue(i, 12),
        dramaticism: this.generateTraitValue(i, 13),
        analyticalDepth: this.generateTraitValue(i, 14),
        contrarianism: this.generateTraitValue(i, 15),
        encouragement: this.generateTraitValue(i, 16),
        curiosity: this.generateTraitValue(i, 17),
        patience: this.generateTraitValue(i, 18),
        isTemplate: i % 20 === 0, // Make 5% templates
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    return personalities;
  }

  private static generateRoles(count: number): FixtureRole[] {
    const roles = [];

    for (let i = 0; i < count; i++) {
      const uuid = this.generateDeterministicUUID(i + 10000); // Offset to avoid personality UUID collisions
      const timestamp = new Date(Date.now() - (count - i) * 1000).toISOString();

      roles.push({
        id: uuid,
        name: `Performance Test Role ${i + 1}`,
        description: `Generated role ${i + 1} for performance testing scenarios with comprehensive capabilities`,
        capabilities: this.generateCapabilities(i),
        constraints: this.generateConstraints(i),
        isTemplate: i % 25 === 0, // Make 4% templates
        version: Math.floor(i / 10) + 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: {
          category: `performance-testing-${i % 5}`,
          complexity: i % 3 === 0 ? "high" : i % 2 === 0 ? "medium" : "low",
          usageCount: Math.floor(Math.random() * 100),
          lastUsed: timestamp,
        },
      });
    }

    return roles;
  }

  private static generateAgents(
    agentCount: number,
    personalityCount: number,
    roleCount: number,
    modelCount: number,
  ): FixtureAgent[] {
    const agents = [];

    for (let i = 0; i < agentCount; i++) {
      agents.push(
        this.createRealisticAgent(i, personalityCount, roleCount, modelCount),
      );
    }

    return agents;
  }

  private static generateCapabilities(index: number): string[] {
    const allCapabilities = [
      "analysis",
      "problem-solving",
      "communication",
      "research",
      "creativity",
      "leadership",
      "planning",
      "execution",
      "monitoring",
      "reporting",
      "collaboration",
      "innovation",
      "optimization",
      "validation",
      "testing",
    ];

    const count = Math.min(3 + (index % 5), 8); // 3-8 capabilities
    const startIndex = index % (allCapabilities.length - count);

    return allCapabilities.slice(startIndex, startIndex + count);
  }

  private static generateConstraints(index: number): string[] {
    const allConstraints = [
      "no-external-api-calls",
      "limited-context-window",
      "read-only-operations",
      "test-environment-only",
      "isolated-environment",
      "memory-constrained",
      "time-limited",
      "supervised-mode",
      "audit-required",
      "compliance-required",
    ];

    const count = Math.min(1 + (index % 3), 4); // 1-4 constraints
    const startIndex = index % (allConstraints.length - count);

    return allConstraints.slice(startIndex, startIndex + count);
  }

  private static generateTraitValue(seed: number, traitIndex: number): number {
    // Generate deterministic but varied trait values (0-100)
    const base = (seed * 17 + traitIndex * 23) % 100;
    return Math.max(5, Math.min(95, base)); // Keep within reasonable bounds
  }

  private static generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  private static generateDeterministicUUID(seed: number): string {
    // Generate a deterministic UUID based on seed for consistent test data
    const hex = seed.toString(16).padStart(8, "0");
    return `550e8400-e29b-41d4-a716-44665544${hex.slice(-4)}`;
  }
}

/**
 * Export for use in test files
 */
export default FixtureValidationUtils;
