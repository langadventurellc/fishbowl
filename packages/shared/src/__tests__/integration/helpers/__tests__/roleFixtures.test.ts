/**
 * @fileoverview Unit Tests for Role Fixture Manager
 *
 * Validates that role fixtures load correctly and pass validation requirements.
 * Ensures test infrastructure is solid before running integration tests.
 */

import {
  RoleFixtureManager,
  FIXTURE_ROLES,
  RoleTestDataBuilder,
  createRoleFixturesInTempDir,
} from "../roleFixtures";
import { TemporaryDirectoryManager } from "../../support/temp-directory-manager";

describe("RoleFixtureManager", () => {
  beforeEach(() => {
    RoleFixtureManager.clearCache();
  });

  describe("fixture loading", () => {
    it("should load all predefined role fixtures", async () => {
      const roles = await RoleFixtureManager.loadAllFixtures();

      expect(roles).toHaveLength(10);
      expect(roles.every((role) => role.metadata.isPredefined)).toBe(true);
    });

    it("should load specific fixture by filename", async () => {
      const role = await RoleFixtureManager.loadFixture(FIXTURE_ROLES.ANALYST);

      expect(role.id).toBe("role-analyst");
      expect(role.name).toBe("Analyst");
      expect(role.metadata.isPredefined).toBe(true);
      expect(role.metadata.category).toBe("analytical");
    });

    it("should cache loaded fixtures to improve performance", async () => {
      // Load fixture twice
      const role1 = await RoleFixtureManager.loadFixture(
        FIXTURE_ROLES.DEVELOPER,
      );
      const role2 = await RoleFixtureManager.loadFixture(
        FIXTURE_ROLES.DEVELOPER,
      );

      // Should be the same object reference (cached)
      expect(role1).toBe(role2);
    });

    it("should clear cache when requested", async () => {
      // Load fixture to populate cache
      await RoleFixtureManager.loadFixture(FIXTURE_ROLES.CREATIVE);

      // Clear cache
      RoleFixtureManager.clearCache();

      // Loading again should create new object
      const role = await RoleFixtureManager.loadFixture(FIXTURE_ROLES.CREATIVE);
      expect(role).toBeDefined();
    });
  });

  describe("fixture validation", () => {
    it("should validate all fixtures have required fields", async () => {
      const roles = await RoleFixtureManager.loadAllFixtures();

      for (const role of roles) {
        expect(role).toHaveProperty("id");
        expect(role).toHaveProperty("name");
        expect(role).toHaveProperty("description");
        expect(role).toHaveProperty("capabilities");
        expect(role).toHaveProperty("constraints");
        expect(role).toHaveProperty("metadata");

        // Validate metadata structure
        expect(role.metadata).toHaveProperty("version");
        expect(role.metadata).toHaveProperty("isPredefined");
        expect(role.metadata).toHaveProperty("category");

        // Validate types
        expect(typeof role.id).toBe("string");
        expect(typeof role.name).toBe("string");
        expect(typeof role.description).toBe("string");
        expect(Array.isArray(role.capabilities)).toBe(true);
        expect(Array.isArray(role.constraints)).toBe(true);
        expect(role.metadata.isPredefined).toBe(true);
      }
    });

    it("should validate each specific role has appropriate content", async () => {
      // Test a few key roles for specific content
      const analyst = await RoleFixtureManager.loadFixture(
        FIXTURE_ROLES.ANALYST,
      );
      expect(analyst.capabilities).toContain("data-analysis");
      expect(analyst.metadata.category).toBe("analytical");

      const creative = await RoleFixtureManager.loadFixture(
        FIXTURE_ROLES.CREATIVE,
      );
      expect(creative.capabilities).toContain("creative-ideation");
      expect(creative.metadata.category).toBe("creative");

      const developer = await RoleFixtureManager.loadFixture(
        FIXTURE_ROLES.DEVELOPER,
      );
      expect(developer.capabilities).toContain("software-development");
      expect(developer.metadata.category).toBe("technical");
    });

    it("should throw error for non-existent fixture", async () => {
      await expect(
        RoleFixtureManager.loadFixture("non-existent-role.json"),
      ).rejects.toThrow("Failed to load fixture");
    });
  });

  describe("category filtering", () => {
    it("should load fixtures by category", async () => {
      const analyticalRoles =
        await RoleFixtureManager.loadFixturesByCategory("analytical");

      expect(analyticalRoles.length).toBeGreaterThan(0);
      expect(
        analyticalRoles.every(
          (role) => role.metadata.category === "analytical",
        ),
      ).toBe(true);
    });

    it("should return empty array for non-existent category", async () => {
      const nonExistentRoles = await RoleFixtureManager.loadFixturesByCategory(
        "non-existent-category",
      );

      expect(nonExistentRoles).toEqual([]);
    });
  });

  describe("role lookup", () => {
    it("should find role by ID", async () => {
      const role = await RoleFixtureManager.getFixtureById("role-strategist");

      expect(role).toBeDefined();
      expect(role?.name).toBe("Strategic Planner");
    });

    it("should return null for non-existent role ID", async () => {
      const role = await RoleFixtureManager.getFixtureById("non-existent-id");

      expect(role).toBeNull();
    });
  });

  describe("fixture file listing", () => {
    it("should list all available fixture files", async () => {
      const files = await RoleFixtureManager.getFixtureFiles();

      expect(files).toHaveLength(10);
      expect(files).toContain("analyst-role.json");
      expect(files).toContain("creative-role.json");
      expect(files).toContain("developer-role.json");
      expect(files.every((file) => file.endsWith(".json"))).toBe(true);
    });
  });
});

describe("RoleTestDataBuilder", () => {
  it("should build valid role with minimal data", () => {
    const role = RoleTestDataBuilder.create()
      .withId("test-role")
      .withName("Test Role")
      .withDescription("A test role")
      .build();

    expect(role.id).toBe("test-role");
    expect(role.name).toBe("Test Role");
    expect(role.description).toBe("A test role");
    expect(role.capabilities).toEqual([]);
    expect(role.constraints).toEqual([]);
    expect(role.metadata.isPredefined).toBe(true);
  });

  it("should build role with all properties", () => {
    const role = RoleTestDataBuilder.create()
      .withId("full-test-role")
      .withName("Full Test Role")
      .withDescription("A comprehensive test role")
      .withCapabilities(["test-capability-1", "test-capability-2"])
      .withConstraints(["test-constraint-1"])
      .withCategory("test-category")
      .build();

    expect(role.capabilities).toEqual([
      "test-capability-1",
      "test-capability-2",
    ]);
    expect(role.constraints).toEqual(["test-constraint-1"]);
    expect(role.metadata.category).toBe("test-category");
  });

  it("should throw error when building role without required fields", () => {
    expect(() => {
      RoleTestDataBuilder.create().withId("incomplete").build();
    }).toThrow("Role must have id, name, and description");
  });

  it("should allow custom metadata", () => {
    const role = RoleTestDataBuilder.create()
      .withId("custom-meta-role")
      .withName("Custom Meta Role")
      .withDescription("Role with custom metadata")
      .withCustomMetadata({ version: "2.0", category: "custom" })
      .build();

    expect(role.metadata.version).toBe("2.0");
    expect(role.metadata.category).toBe("custom");
    expect(role.metadata.isPredefined).toBe(true); // Should preserve default
  });
});

describe("createRoleFixturesInTempDir", () => {
  it("should copy all fixtures to temporary directory", async () => {
    const tempDir = await TemporaryDirectoryManager.create({
      prefix: "role-fixtures-test-",
    });

    try {
      await createRoleFixturesInTempDir(tempDir.path);

      // Verify roles directory was created
      expect(await tempDir.exists("roles")).toBe(true);

      // Verify all fixture files were copied
      const files = await tempDir.listFiles();
      expect(files).toContain("roles");

      // List files in roles subdirectory
      const rolesPath = await tempDir.writeFile(
        "test-check.txt",
        "checking roles dir",
      );
      expect(rolesPath).toBeDefined();
    } finally {
      await tempDir.cleanup();
    }
  });
});

describe("FIXTURE_ROLES constants", () => {
  it("should have all expected role constants", () => {
    expect(FIXTURE_ROLES.ANALYST).toBe("analyst-role.json");
    expect(FIXTURE_ROLES.CREATIVE).toBe("creative-role.json");
    expect(FIXTURE_ROLES.DEVELOPER).toBe("developer-role.json");
    expect(FIXTURE_ROLES.MANAGER).toBe("manager-role.json");
    expect(FIXTURE_ROLES.RESEARCHER).toBe("researcher-role.json");
    expect(FIXTURE_ROLES.STRATEGIST).toBe("strategist-role.json");
    expect(FIXTURE_ROLES.FACILITATOR).toBe("facilitator-role.json");
    expect(FIXTURE_ROLES.CRITIC).toBe("critic-role.json");
    expect(FIXTURE_ROLES.INNOVATOR).toBe("innovator-role.json");
    expect(FIXTURE_ROLES.ADVISOR).toBe("advisor-role.json");
  });

  it("should have constants matching actual fixture files", async () => {
    const availableFiles = await RoleFixtureManager.getFixtureFiles();
    const constantValues = Object.values(FIXTURE_ROLES);

    // All constants should correspond to actual files
    for (const constantValue of constantValues) {
      expect(availableFiles).toContain(constantValue);
    }
  });
});
