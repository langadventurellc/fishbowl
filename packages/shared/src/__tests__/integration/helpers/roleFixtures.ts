/**
 * @fileoverview Role Fixture Manager for Test Infrastructure
 *
 * Manages loading and validation of predefined role fixtures for integration tests.
 * Provides centralized access to role test data with validation and caching.
 */

import { promises as fs } from "fs";
import { join } from "path";
import type { PredefinedRole } from "../support/mock-factories";

/**
 * Manager for loading and validating role fixtures
 */
export class RoleFixtureManager {
  private static readonly FIXTURES_DIR = join(
    process.cwd(),
    "src",
    "__tests__",
    "integration",
    "fixtures",
    "predefined-roles",
  );
  private static fixtureCache = new Map<string, PredefinedRole>();

  /**
   * Load a specific role fixture by filename
   */
  static async loadFixture(roleFileName: string): Promise<PredefinedRole> {
    if (this.fixtureCache.has(roleFileName)) {
      return this.fixtureCache.get(roleFileName)!;
    }

    const filePath = join(this.FIXTURES_DIR, roleFileName);

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const role = JSON.parse(fileContent) as PredefinedRole;

      this.validateFixture(role, roleFileName);
      this.fixtureCache.set(roleFileName, role);

      return role;
    } catch (error) {
      throw new Error(
        `Failed to load fixture ${roleFileName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Load all available role fixtures
   */
  static async loadAllFixtures(): Promise<PredefinedRole[]> {
    const fixtureFiles = await this.getFixtureFiles();
    const roles: PredefinedRole[] = [];

    for (const fileName of fixtureFiles) {
      const role = await this.loadFixture(fileName);
      roles.push(role);
    }

    return roles;
  }

  /**
   * Get list of available fixture files
   */
  static async getFixtureFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.FIXTURES_DIR);
      return files.filter((file) => file.endsWith(".json")).sort();
    } catch (error) {
      throw new Error(
        `Failed to read fixtures directory: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Load fixtures by category
   */
  static async loadFixturesByCategory(
    category: string,
  ): Promise<PredefinedRole[]> {
    const allRoles = await this.loadAllFixtures();
    return allRoles.filter((role) => role.metadata.category === category);
  }

  /**
   * Get a specific fixture by role ID
   */
  static async getFixtureById(roleId: string): Promise<PredefinedRole | null> {
    const allRoles = await this.loadAllFixtures();
    return allRoles.find((role) => role.id === roleId) ?? null;
  }

  /**
   * Clear the fixture cache
   */
  static clearCache(): void {
    this.fixtureCache.clear();
  }

  /**
   * Validate that a fixture has all required fields and proper structure
   */
  private static validateFixture(role: unknown, fileName: string): void {
    if (typeof role !== "object" || role === null) {
      throw new Error(`Fixture ${fileName} must be an object`);
    }

    const roleObj = role as Record<string, unknown>;
    const requiredFields = [
      "id",
      "name",
      "description",
      "capabilities",
      "constraints",
      "metadata",
    ];

    for (const field of requiredFields) {
      if (!(field in roleObj)) {
        throw new Error(`Fixture ${fileName} missing required field: ${field}`);
      }
    }

    // Validate metadata structure
    if (typeof roleObj.metadata !== "object" || roleObj.metadata === null) {
      throw new Error(`Fixture ${fileName} metadata must be an object`);
    }

    const metadata = roleObj.metadata as Record<string, unknown>;
    const requiredMetadataFields = ["version", "isPredefined", "category"];

    for (const field of requiredMetadataFields) {
      if (!(field in metadata)) {
        throw new Error(
          `Fixture ${fileName} metadata missing required field: ${field}`,
        );
      }
    }

    // Validate array fields
    if (!Array.isArray(roleObj.capabilities)) {
      throw new Error(`Fixture ${fileName} capabilities must be an array`);
    }

    if (!Array.isArray(roleObj.constraints)) {
      throw new Error(`Fixture ${fileName} constraints must be an array`);
    }

    // Validate isPredefined flag
    if (metadata.isPredefined !== true) {
      throw new Error(
        `Fixture ${fileName} must have isPredefined: true in metadata`,
      );
    }

    // Validate string fields
    const stringFields = ["id", "name", "description"];
    for (const field of stringFields) {
      if (typeof roleObj[field] !== "string" || !roleObj[field]) {
        throw new Error(
          `Fixture ${fileName} ${field} must be a non-empty string`,
        );
      }
    }
  }
}

/**
 * Constants for predefined role fixture filenames
 */
export const FIXTURE_ROLES = {
  ANALYST: "analyst-role.json",
  CREATIVE: "creative-role.json",
  DEVELOPER: "developer-role.json",
  MANAGER: "manager-role.json",
  RESEARCHER: "researcher-role.json",
  STRATEGIST: "strategist-role.json",
  FACILITATOR: "facilitator-role.json",
  CRITIC: "critic-role.json",
  INNOVATOR: "innovator-role.json",
  ADVISOR: "advisor-role.json",
} as const;

/**
 * Helper function to create realistic role fixtures in temporary directories
 */
export async function createRoleFixturesInTempDir(
  tempDirPath: string,
): Promise<void> {
  const rolesDir = join(tempDirPath, "roles");
  await fs.mkdir(rolesDir, { recursive: true });

  // Copy all fixture files to temp directory
  const fixtureFiles = await RoleFixtureManager.getFixtureFiles();

  for (const fileName of fixtureFiles) {
    const role = await RoleFixtureManager.loadFixture(fileName);
    const destPath = join(rolesDir, fileName);
    await fs.writeFile(destPath, JSON.stringify(role, null, 2), "utf-8");
  }
}

/**
 * Test data builder for creating role variations
 */
export class RoleTestDataBuilder {
  private role: Partial<PredefinedRole> = {
    metadata: {
      version: "1.0",
      isPredefined: true,
      category: "test",
    },
  };

  static create(): RoleTestDataBuilder {
    return new RoleTestDataBuilder();
  }

  withId(id: string): RoleTestDataBuilder {
    this.role.id = id;
    return this;
  }

  withName(name: string): RoleTestDataBuilder {
    this.role.name = name;
    return this;
  }

  withDescription(description: string): RoleTestDataBuilder {
    this.role.description = description;
    return this;
  }

  withCapabilities(capabilities: string[]): RoleTestDataBuilder {
    this.role.capabilities = capabilities;
    return this;
  }

  withConstraints(constraints: string[]): RoleTestDataBuilder {
    this.role.constraints = constraints;
    return this;
  }

  withCategory(category: string): RoleTestDataBuilder {
    if (this.role.metadata) {
      this.role.metadata.category = category;
    }
    return this;
  }

  withCustomMetadata(
    metadata: Partial<PredefinedRole["metadata"]>,
  ): RoleTestDataBuilder {
    this.role.metadata = {
      version: "1.0",
      isPredefined: true,
      category: "test",
      ...this.role.metadata,
      ...metadata,
    };
    return this;
  }

  build(): PredefinedRole {
    if (!this.role.id || !this.role.name || !this.role.description) {
      throw new Error("Role must have id, name, and description");
    }

    return {
      id: this.role.id,
      name: this.role.name,
      description: this.role.description,
      capabilities: this.role.capabilities ?? [],
      constraints: this.role.constraints ?? [],
      metadata: this.role.metadata!,
    };
  }
}
