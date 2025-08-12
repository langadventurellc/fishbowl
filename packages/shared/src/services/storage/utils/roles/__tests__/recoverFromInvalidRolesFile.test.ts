import { recoverFromInvalidRolesFile } from "../recoverFromInvalidRolesFile";
import { SettingsValidationError } from "../../../errors/SettingsValidationError";

describe("recoverFromInvalidRolesFile", () => {
  const mockFilePath = "/path/to/roles.json";
  const mockError = new SettingsValidationError(mockFilePath, "test", [
    { path: "roles.0.name", message: "Name is required" },
  ]);

  const validRole = {
    id: "valid-role",
    name: "Valid Role",
    description: "A valid role",
    systemPrompt: "You are helpful",
    createdAt: "2025-01-15T10:30:00.000Z",
    updatedAt: "2025-01-15T10:30:00.000Z",
  };

  const invalidRole = {
    id: "",
    name: "",
    description: "Invalid role with empty required fields",
    systemPrompt: "test",
  };

  describe("partial recovery", () => {
    it("should recover valid roles from mixed array", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [validRole, invalidRole],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.recoveryType).toBe("partial");
      expect(result.data.roles).toHaveLength(1);
      expect(result.data.roles[0]).toEqual(validRole);
      expect(result.skippedRoles).toBe(1);
    });

    it("should preserve valid schema version during recovery", () => {
      const invalidData = {
        schemaVersion: "2.0.0",
        roles: [validRole],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.data.schemaVersion).toBe("2.0.0");
    });

    it("should use default schema version when invalid", () => {
      const invalidData = {
        schemaVersion: null,
        roles: [validRole],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.data.schemaVersion).toBe("1.0.0");
    });

    it("should preserve valid lastUpdated during recovery", () => {
      const timestamp = "2025-02-01T15:45:00.000Z";
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [validRole],
        lastUpdated: timestamp,
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.data.lastUpdated).toBe(timestamp);
    });

    it("should generate new lastUpdated when invalid", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [validRole],
        lastUpdated: null,
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.data.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    });
  });

  describe("fallback to default", () => {
    it("should fall back to defaults when data is not an object", () => {
      const invalidData = "not an object";

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.recoveryType).toBe("default");
      expect(result.data.schemaVersion).toBe("1.0.0");
      expect(result.data.roles).toHaveLength(4);
      expect(result.data.roles[0]).toHaveProperty("id", "project-manager");
      expect(result.data.roles[1]).toHaveProperty("id", "code-reviewer");
      expect(result.data.roles[2]).toHaveProperty("id", "creative-writer");
      expect(result.data.roles[3]).toHaveProperty("id", "data-analyst");
      expect(result.data.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
      expect(result.errors).toEqual(mockError.fieldErrors);
    });

    it("should fall back to defaults when data is null", () => {
      const invalidData = null;

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.recoveryType).toBe("default");
      expect(result.data.schemaVersion).toBe("1.0.0");
      expect(result.data.roles).toHaveLength(4);
      expect(result.data.roles[0]).toHaveProperty("id", "project-manager");
      expect(result.data.roles[1]).toHaveProperty("id", "code-reviewer");
      expect(result.data.roles[2]).toHaveProperty("id", "creative-writer");
      expect(result.data.roles[3]).toHaveProperty("id", "data-analyst");
      expect(result.data.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    });

    it("should fall back to defaults when roles field is missing", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.recoveryType).toBe("default");
      expect(result.data.schemaVersion).toBe("1.0.0");
      expect(result.data.roles).toHaveLength(4);
      expect(result.data.roles[0]).toHaveProperty("id", "project-manager");
      expect(result.data.roles[1]).toHaveProperty("id", "code-reviewer");
      expect(result.data.roles[2]).toHaveProperty("id", "creative-writer");
      expect(result.data.roles[3]).toHaveProperty("id", "data-analyst");
      expect(result.data.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    });

    it("should fall back to defaults when roles is not an array", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: "not an array",
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.recoveryType).toBe("default");
      expect(result.data.schemaVersion).toBe("1.0.0");
      expect(result.data.roles).toHaveLength(4);
      expect(result.data.roles[0]).toHaveProperty("id", "project-manager");
      expect(result.data.roles[1]).toHaveProperty("id", "code-reviewer");
      expect(result.data.roles[2]).toHaveProperty("id", "creative-writer");
      expect(result.data.roles[3]).toHaveProperty("id", "data-analyst");
      expect(result.data.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    });

    it("should fall back to defaults when no valid roles found", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [invalidRole, { id: "bad", name: "" }],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.recoveryType).toBe("default");
      expect(result.data.schemaVersion).toBe("1.0.0");
      expect(result.data.roles).toHaveLength(4);
      expect(result.data.roles[0]).toHaveProperty("id", "project-manager");
      expect(result.data.roles[1]).toHaveProperty("id", "code-reviewer");
      expect(result.data.roles[2]).toHaveProperty("id", "creative-writer");
      expect(result.data.roles[3]).toHaveProperty("id", "data-analyst");
      expect(result.data.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    });
  });

  describe("error handling", () => {
    it("should include validation errors in result", () => {
      const multiError = new SettingsValidationError(mockFilePath, "test", [
        { path: "roles.0.name", message: "Name is required" },
        { path: "roles.1.id", message: "ID cannot be empty" },
      ]);

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        "invalid",
        multiError,
      );

      expect(result.errors).toEqual(multiError.fieldErrors);
      expect(result.errors).toHaveLength(2);
    });

    it("should maintain error context in fallback scenarios", () => {
      const contextError = new SettingsValidationError(
        mockFilePath,
        "loadRoles",
        [{ path: "root", message: "Complete validation failure" }],
      );

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        null,
        contextError,
      );

      expect(result.errors).toEqual(contextError.fieldErrors);
      expect(result.recoveryType).toBe("default");
    });
  });

  describe("edge cases", () => {
    it("should handle empty roles array", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.recoveryType).toBe("default");
      expect(result.data.roles).toHaveLength(4);
      expect(result.data.roles[0]).toHaveProperty("id", "project-manager");
    });

    it("should handle roles array with all valid data", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          validRole,
          { ...validRole, id: "second-role", name: "Second Role" },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = recoverFromInvalidRolesFile(
        mockFilePath,
        invalidData,
        mockError,
      );

      expect(result.recovered).toBe(true);
      expect(result.recoveryType).toBe("partial");
      expect(result.data.roles).toHaveLength(2);
      expect(result.skippedRoles).toBe(0);
    });
  });
});
