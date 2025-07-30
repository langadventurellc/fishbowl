/**
 * @fileoverview Custom Role Fixture Manager for Test Infrastructure
 *
 * Manages loading and validation of custom role fixtures for integration tests.
 * Provides centralized access to custom role test data with validation and caching.
 */

import { promises as fs } from "fs";
import { join } from "path";
import type { CustomRole } from "../../../types/role";

/**
 * Categories for organizing custom role fixtures
 */
export enum CustomRoleFixtureCategory {
  VALID = "valid",
  INVALID = "invalid",
  TEMPLATE_BASED = "template-based",
  COMPLEX = "complex",
  MINIMAL = "minimal",
  BUSINESS_RULE_VIOLATIONS = "business-rule-violations",
}

/**
 * Manager for loading and validating custom role fixtures
 */
export class CustomRoleFixtureManager {
  private static readonly FIXTURES_DIR = join(
    process.cwd(),
    "src",
    "__tests__",
    "integration",
    "fixtures",
    "custom-roles",
  );
  private static fixtureCache = new Map<string, CustomRole>();
  private static invalidFixtureCache = new Map<string, unknown>();

  /**
   * Load all available custom role fixtures
   */
  static async loadAllCustomFixtures(): Promise<CustomRole[]> {
    const fixtureFiles = await this.getCustomFixtureFiles();
    const roles: CustomRole[] = [];

    for (const fileName of fixtureFiles) {
      // Only load valid fixtures for this method
      if (
        !fileName.includes("invalid") &&
        !fileName.includes("missing") &&
        !fileName.includes("violations")
      ) {
        try {
          const role = await this.loadCustomFixture(fileName);
          roles.push(role);
        } catch {
          // Skip invalid fixtures when loading all valid fixtures
          continue;
        }
      }
    }

    return roles;
  }

  /**
   * Load a specific custom role fixture by filename
   */
  static async loadCustomFixture(roleFileName: string): Promise<CustomRole> {
    if (this.fixtureCache.has(roleFileName)) {
      return this.fixtureCache.get(roleFileName)!;
    }

    const filePath = join(this.FIXTURES_DIR, roleFileName);

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const role = JSON.parse(fileContent) as CustomRole;

      this.validateCustomFixture(role, roleFileName);
      this.fixtureCache.set(roleFileName, role);

      return role;
    } catch (error) {
      throw new Error(
        `Failed to load custom role fixture ${roleFileName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Load invalid fixture for validation testing (returns raw object)
   */
  static async loadInvalidCustomFixture(
    roleFileName: string,
  ): Promise<unknown> {
    if (this.invalidFixtureCache.has(roleFileName)) {
      return this.invalidFixtureCache.get(roleFileName)!;
    }

    const filePath = join(this.FIXTURES_DIR, roleFileName);

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const role = JSON.parse(fileContent);

      this.invalidFixtureCache.set(roleFileName, role);
      return role;
    } catch (error) {
      throw new Error(
        `Failed to load invalid custom role fixture ${roleFileName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Load custom role fixtures by category
   */
  static async loadCustomFixturesByCategory(
    category: CustomRoleFixtureCategory,
  ): Promise<CustomRole[]> {
    const allRoles = await this.loadAllCustomFixtures();

    switch (category) {
      case CustomRoleFixtureCategory.VALID:
        return allRoles.filter((role) => !this.isTestFixture(role));
      case CustomRoleFixtureCategory.TEMPLATE_BASED:
        return allRoles.filter((role) => role.templateId !== undefined);
      case CustomRoleFixtureCategory.COMPLEX:
        return allRoles.filter(
          (role) =>
            role.capabilities.length > 10 ||
            role.constraints.length > 5 ||
            role.metadata?.complexity === "advanced",
        );
      case CustomRoleFixtureCategory.MINIMAL:
        return allRoles.filter(
          (role) =>
            role.capabilities.length <= 2 &&
            role.constraints.length <= 1 &&
            role.metadata?.complexity === "basic",
        );
      default:
        return allRoles;
    }
  }

  /**
   * Get a specific custom role fixture by role ID
   */
  static async getCustomFixtureById(
    roleId: string,
  ): Promise<CustomRole | null> {
    const allRoles = await this.loadAllCustomFixtures();
    return allRoles.find((role) => role.id === roleId) ?? null;
  }

  /**
   * Get list of available custom role fixture files
   */
  static async getCustomFixtureFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.FIXTURES_DIR);
      return files.filter((file) => file.endsWith(".json")).sort();
    } catch (error) {
      throw new Error(
        `Failed to read custom role fixtures directory: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Clear the fixture caches
   */
  static clearCache(): void {
    this.fixtureCache.clear();
    this.invalidFixtureCache.clear();
  }

  /**
   * Check if role is a test fixture (not a "real" custom role example)
   */
  private static isTestFixture(role: CustomRole): boolean {
    return (
      role.metadata?.tags?.includes("test") ||
      role.metadata?.tags?.includes("invalid") ||
      role.name.toLowerCase().includes("test") ||
      role.name.toLowerCase().includes("invalid")
    );
  }

  /**
   * Validate that a custom role fixture has all required fields and proper structure
   */
  private static validateCustomFixture(role: unknown, fileName: string): void {
    if (typeof role !== "object" || role === null) {
      throw new Error(`Custom role fixture ${fileName} must be an object`);
    }

    const roleObj = role as Record<string, unknown>;
    const requiredFields = [
      "id",
      "name",
      "description",
      "capabilities",
      "constraints",
      "isTemplate",
      "createdAt",
      "updatedAt",
      "version",
    ];

    for (const field of requiredFields) {
      if (!(field in roleObj)) {
        throw new Error(
          `Custom role fixture ${fileName} missing required field: ${field}`,
        );
      }
    }

    // Validate string fields
    const stringFields = ["id", "name", "description"];
    for (const field of stringFields) {
      if (typeof roleObj[field] !== "string" || !roleObj[field]) {
        throw new Error(
          `Custom role fixture ${fileName} ${field} must be a non-empty string`,
        );
      }
    }

    // Validate array fields
    if (!Array.isArray(roleObj.capabilities)) {
      throw new Error(
        `Custom role fixture ${fileName} capabilities must be an array`,
      );
    }

    if (!Array.isArray(roleObj.constraints)) {
      throw new Error(
        `Custom role fixture ${fileName} constraints must be an array`,
      );
    }

    // Validate capabilities are not empty for valid fixtures
    if (
      roleObj.capabilities.length === 0 &&
      !fileName.includes("business-rule-violations")
    ) {
      throw new Error(
        `Custom role fixture ${fileName} must have at least one capability`,
      );
    }

    // Validate boolean fields
    if (typeof roleObj.isTemplate !== "boolean") {
      throw new Error(
        `Custom role fixture ${fileName} isTemplate must be a boolean`,
      );
    }

    // Validate version is a positive number
    if (typeof roleObj.version !== "number" || roleObj.version < 1) {
      throw new Error(
        `Custom role fixture ${fileName} version must be a positive number`,
      );
    }

    // Validate dates
    const dateFields = ["createdAt", "updatedAt"];
    for (const field of dateFields) {
      if (typeof roleObj[field] !== "string") {
        throw new Error(
          `Custom role fixture ${fileName} ${field} must be a string`,
        );
      }

      const date = new Date(roleObj[field] as string);
      if (isNaN(date.getTime())) {
        throw new Error(
          `Custom role fixture ${fileName} ${field} must be a valid ISO date string`,
        );
      }
    }

    // Validate metadata if present
    if (roleObj.metadata !== undefined) {
      if (typeof roleObj.metadata !== "object" || roleObj.metadata === null) {
        throw new Error(
          `Custom role fixture ${fileName} metadata must be an object`,
        );
      }

      const metadata = roleObj.metadata as Record<string, unknown>;

      // Validate complexity enum if present
      if (metadata.complexity !== undefined) {
        const validComplexities = ["basic", "intermediate", "advanced"];
        if (!validComplexities.includes(metadata.complexity as string)) {
          throw new Error(
            `Custom role fixture ${fileName} metadata.complexity must be one of: ${validComplexities.join(", ")}`,
          );
        }
      }

      // Validate tags array if present
      if (metadata.tags !== undefined && !Array.isArray(metadata.tags)) {
        throw new Error(
          `Custom role fixture ${fileName} metadata.tags must be an array`,
        );
      }
    }
  }
}

/**
 * Constants for custom role fixture filenames
 */
export const CUSTOM_ROLE_FIXTURES = {
  VALID: "custom-role-valid.json",
  TEMPLATE_BASED: "custom-role-template-based.json",
  MINIMAL: "custom-role-minimal.json",
  COMPLEX_CAPABILITIES: "custom-role-complex-capabilities.json",
  INVALID_CAPABILITIES: "custom-role-invalid-capabilities.json",
  MISSING_REQUIRED: "custom-role-missing-required.json",
  INVALID_CONSTRAINTS: "custom-role-invalid-constraints.json",
  BUSINESS_RULE_VIOLATIONS: "custom-role-business-rule-violations.json",
} as const;

/**
 * Helper function to create custom role fixtures in temporary directories
 */
export async function createCustomRoleFixturesInTempDir(
  tempDirPath: string,
): Promise<void> {
  const customRolesDir = join(tempDirPath, "custom-roles");
  await fs.mkdir(customRolesDir, { recursive: true });

  // Copy all valid fixture files to temp directory
  const fixtureFiles = await CustomRoleFixtureManager.getCustomFixtureFiles();

  for (const fileName of fixtureFiles) {
    // Only copy valid fixtures to temp directory
    if (
      !fileName.includes("invalid") &&
      !fileName.includes("missing") &&
      !fileName.includes("violations")
    ) {
      try {
        const role = await CustomRoleFixtureManager.loadCustomFixture(fileName);
        const destPath = join(customRolesDir, fileName);
        await fs.writeFile(destPath, JSON.stringify(role, null, 2), "utf-8");
      } catch {
        // Skip invalid fixtures when copying to temp directory
        continue;
      }
    }
  }
}
