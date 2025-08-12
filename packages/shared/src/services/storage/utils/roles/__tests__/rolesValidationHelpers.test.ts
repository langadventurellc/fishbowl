import {
  validateSingleRole,
  validateRoleFormData,
  validateRolesArray,
  isValidRolesData,
  checkRolesSchemaCompatibility,
  validateRoleName,
  validateRoleDescription,
  validateSystemPrompt,
  validateRoleId,
  normalizeTimestamps,
  isValidTimestamp,
  addDefaultTimestamps,
  validateMultipleRoles,
  filterValidRoles,
  reportBatchValidationResults,
  type BatchValidationResult,
} from "../index";

describe("Role Validation Helpers", () => {
  const validRoleData = {
    id: "test-role-1",
    name: "Test Role",
    description: "A test role for validation",
    systemPrompt: "You are a helpful assistant",
    createdAt: "2025-01-15T10:30:00.000Z",
    updatedAt: "2025-01-15T10:30:00.000Z",
  };

  const validRoleDataMinimal = {
    id: "minimal-role",
    name: "Minimal",
    description: "",
    systemPrompt: "",
  };

  describe("validateSingleRole", () => {
    it("should validate a complete valid role", () => {
      const result = validateSingleRole(validRoleData);
      expect(result).toEqual(validRoleData);
    });

    it("should validate a minimal valid role", () => {
      const result = validateSingleRole(validRoleDataMinimal);
      expect(result.id).toBe("minimal-role");
      expect(result.name).toBe("Minimal");
    });

    it("should throw SettingsValidationError for invalid role", () => {
      expect(() => {
        validateSingleRole({ id: "", name: "Invalid" });
      }).toThrow("Settings validation failed");
    });

    it("should include context in error messages", () => {
      expect(() => {
        validateSingleRole({ id: "" }, "Role creation test");
      }).toThrow();
    });
  });

  describe("validateRoleFormData", () => {
    const validFormData = {
      name: "Form Role",
      description: "From form",
      systemPrompt: "Form prompt",
    };

    it("should return valid for good form data", () => {
      const result = validateRoleFormData(validFormData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return invalid for name too long", () => {
      const result = validateRoleFormData({
        ...validFormData,
        name: "x".repeat(101), // Exceeds 100 char limit
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.message).toContain(
        "cannot exceed 100 characters",
      );
    });

    it("should return invalid for empty name", () => {
      const result = validateRoleFormData({
        ...validFormData,
        name: "",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes("required"))).toBe(
        true,
      );
    });

    it("should return invalid for description too long", () => {
      const result = validateRoleFormData({
        ...validFormData,
        description: "x".repeat(501), // Exceeds 500 char limit
      });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain(
        "cannot exceed 500 characters",
      );
    });

    it("should return invalid for system prompt too long", () => {
      const result = validateRoleFormData({
        ...validFormData,
        systemPrompt: "x".repeat(5001), // Exceeds 5000 char limit
      });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain(
        "cannot exceed 5000 characters",
      );
    });
  });

  describe("validateRolesArray", () => {
    it("should validate array of valid roles", () => {
      const rolesArray = [validRoleData, validRoleDataMinimal];
      const result = validateRolesArray(rolesArray);

      expect(result.validRoles).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.validRoles[0]?.name).toBe("Test Role");
      expect(result.validRoles[1]?.name).toBe("Minimal");
    });

    it("should handle mixed valid/invalid with partial failure allowed", () => {
      const rolesArray = [
        validRoleData,
        { id: "", name: "Invalid", description: "", systemPrompt: "" },
        validRoleDataMinimal,
      ];

      const result = validateRolesArray(rolesArray, true);

      expect(result.validRoles).toHaveLength(2);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.path).toContain("roles.1");
    });

    it("should stop on first error when partial failure not allowed", () => {
      const rolesArray = [
        validRoleData,
        { id: "", name: "Invalid" },
        validRoleDataMinimal,
      ];

      const result = validateRolesArray(rolesArray, false);

      expect(result.validRoles).toHaveLength(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle non-array input", () => {
      const result = validateRolesArray("not-an-array");

      expect(result.validRoles).toHaveLength(0);
      expect(result.errors[0]?.message).toBe("Input must be an array of roles");
    });
  });

  describe("isValidRolesData", () => {
    it("should return true for valid roles data", () => {
      const validData = {
        schemaVersion: "1.0.0",
        roles: [validRoleData],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      expect(isValidRolesData(validData)).toBe(true);
    });

    it("should return true for minimal valid data", () => {
      const minimalData = {
        roles: [],
      };

      expect(isValidRolesData(minimalData)).toBe(true);
    });

    it("should return false for invalid data", () => {
      const invalidData = {
        roles: "not-an-array",
      };

      expect(isValidRolesData(invalidData)).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isValidRolesData(null)).toBe(false);
      expect(isValidRolesData(undefined)).toBe(false);
    });
  });

  describe("checkRolesSchemaCompatibility", () => {
    it("should return compatible for valid structure", () => {
      const data = {
        schemaVersion: "1.0.0",
        roles: [validRoleData],
      };

      const result = checkRolesSchemaCompatibility(data);
      expect(result.compatible).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should detect non-object data", () => {
      const result = checkRolesSchemaCompatibility("string");
      expect(result.compatible).toBe(false);
      expect(result.issues).toContain("Data must be an object");
    });

    it("should detect invalid schema version", () => {
      const data = { schemaVersion: 123 };
      const result = checkRolesSchemaCompatibility(data);
      expect(result.compatible).toBe(false);
      expect(result.issues).toContain("Schema version must be a string");
    });

    it("should detect invalid schema version format", () => {
      const data = { schemaVersion: "invalid-version" };
      const result = checkRolesSchemaCompatibility(data);
      expect(result.compatible).toBe(false);
      expect(result.issues[0]).toContain("Invalid schema version format");
    });

    it("should detect non-array roles", () => {
      const data = { roles: "not-array" };
      const result = checkRolesSchemaCompatibility(data);
      expect(result.compatible).toBe(false);
      expect(result.issues).toContain("Roles must be an array");
    });

    it("should detect missing required fields in roles", () => {
      const data = {
        roles: [{ name: "Missing ID" }, { id: "missing-name" }],
      };
      const result = checkRolesSchemaCompatibility(data);
      expect(result.compatible).toBe(false);
      expect(
        result.issues.some((issue) =>
          issue.includes("missing required field: id"),
        ),
      ).toBe(true);
      expect(
        result.issues.some((issue) =>
          issue.includes("missing required field: name"),
        ),
      ).toBe(true);
    });
  });

  describe("Field Validators", () => {
    describe("validateRoleName", () => {
      it("should validate good name", () => {
        const result = validateRoleName("Good Name");
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should reject empty name", () => {
        const result = validateRoleName("");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Role name is required");
      });

      it("should reject name too long", () => {
        const longName = "x".repeat(101);
        const result = validateRoleName(longName);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("cannot exceed 100 characters");
        expect(result.error).toContain("current: 101");
      });

      it("should reject non-string", () => {
        const result = validateRoleName(123 as unknown as string);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Role name must be a string");
      });
    });

    describe("validateRoleDescription", () => {
      it("should validate good description", () => {
        const result = validateRoleDescription("Good description");
        expect(result.isValid).toBe(true);
      });

      it("should allow empty description", () => {
        const result = validateRoleDescription("");
        expect(result.isValid).toBe(true);
      });

      it("should reject description too long", () => {
        const longDesc = "x".repeat(501);
        const result = validateRoleDescription(longDesc);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("cannot exceed 500 characters");
      });
    });

    describe("validateSystemPrompt", () => {
      it("should validate good prompt", () => {
        const result = validateSystemPrompt("You are a helpful assistant");
        expect(result.isValid).toBe(true);
      });

      it("should allow empty prompt", () => {
        const result = validateSystemPrompt("");
        expect(result.isValid).toBe(true);
      });

      it("should reject prompt too long", () => {
        const longPrompt = "x".repeat(5001);
        const result = validateSystemPrompt(longPrompt);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("cannot exceed 5000 characters");
      });
    });

    describe("validateRoleId", () => {
      it("should validate good ID", () => {
        const result = validateRoleId("valid-id-123");
        expect(result.isValid).toBe(true);
      });

      it("should reject empty ID", () => {
        const result = validateRoleId("");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Role ID cannot be empty");
      });

      it("should reject non-string ID", () => {
        const result = validateRoleId(123 as unknown as string);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Role ID must be a string");
      });
    });
  });

  describe("Timestamp Utilities", () => {
    describe("isValidTimestamp", () => {
      it("should accept valid ISO timestamp", () => {
        expect(isValidTimestamp("2025-01-15T10:30:00.000Z")).toBe(true);
      });

      it("should accept null/undefined", () => {
        expect(isValidTimestamp(null)).toBe(true);
        expect(isValidTimestamp(undefined)).toBe(true);
      });

      it("should reject invalid timestamp", () => {
        expect(isValidTimestamp("invalid-date")).toBe(false);
        expect(isValidTimestamp(123)).toBe(false);
        expect(isValidTimestamp("2025-13-45")).toBe(false);
      });
    });

    describe("normalizeTimestamps", () => {
      it("should preserve valid timestamps", () => {
        const data = {
          id: "test",
          createdAt: "2025-01-15T10:30:00.000Z",
          updatedAt: "2025-01-15T10:30:00.000Z",
        };
        const result = normalizeTimestamps(data);
        expect(result.createdAt).toBe("2025-01-15T10:30:00.000Z");
        expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
      });

      it("should preserve null timestamps", () => {
        const data = {
          id: "test",
          createdAt: null,
          updatedAt: null,
        };
        const result = normalizeTimestamps(data);
        expect(result.createdAt).toBeNull();
        expect(result.updatedAt).toBeNull();
      });

      it("should normalize invalid timestamps to null", () => {
        const data = {
          id: "test",
          createdAt: "invalid-date" as unknown as string | null | undefined,
          updatedAt: 123 as unknown as string | null | undefined,
        };
        const result = normalizeTimestamps(data);
        expect(result.createdAt).toBeNull();
        expect(result.updatedAt).toBeNull();
      });
    });

    describe("addDefaultTimestamps", () => {
      beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2025-01-15T10:30:00.000Z"));
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it("should add current timestamps", () => {
        const data = {
          id: "test",
          name: "Test",
          description: "Test",
          systemPrompt: "Test",
        };
        const result = addDefaultTimestamps(data);
        expect(result.createdAt).toBe("2025-01-15T10:30:00.000Z");
        expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
        expect(result.id).toBe("test");
      });
    });
  });

  describe("Batch Operations", () => {
    describe("validateMultipleRoles", () => {
      it("should validate all valid roles", () => {
        const roles = [validRoleData, validRoleDataMinimal];
        const result = validateMultipleRoles(roles);

        expect(result.totalCount).toBe(2);
        expect(result.validCount).toBe(2);
        expect(result.invalidCount).toBe(0);
        expect(result.validRoles).toHaveLength(2);
        expect(result.errors).toHaveLength(0);
      });

      it("should handle mixed valid/invalid", () => {
        const roles = [
          validRoleData,
          { id: "", name: "Invalid" },
          validRoleDataMinimal,
        ];
        const result = validateMultipleRoles(roles);

        expect(result.totalCount).toBe(3);
        expect(result.validCount).toBe(2);
        expect(result.invalidCount).toBe(1);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]?.index).toBe(1);
      });

      it("should handle non-array input", () => {
        const result = validateMultipleRoles(
          "not-array" as unknown as unknown[],
        );
        expect(result.totalCount).toBe(0);
        expect(result.invalidCount).toBe(1);
        expect(result.errors[0]?.errors[0]?.message).toBe(
          "Input must be an array",
        );
      });
    });

    describe("filterValidRoles", () => {
      it("should return only valid roles", () => {
        const roles = [
          validRoleData,
          { id: "", name: "Invalid" },
          validRoleDataMinimal,
          null,
          "not-object",
        ];

        const result = filterValidRoles(roles);
        expect(result).toHaveLength(2);
        expect(result[0]?.name).toBe("Test Role");
        expect(result[1]?.name).toBe("Minimal");
      });

      it("should handle non-array input", () => {
        const result = filterValidRoles("not-array" as unknown as unknown[]);
        expect(result).toHaveLength(0);
      });
    });

    describe("reportBatchValidationResults", () => {
      it("should generate report for successful validation", () => {
        const results: BatchValidationResult = {
          totalCount: 2,
          validCount: 2,
          invalidCount: 0,
          validRoles: [validRoleData, validRoleDataMinimal],
          errors: [],
        };

        const report = reportBatchValidationResults(results);
        expect(report).toContain("Total roles: 2");
        expect(report).toContain("Valid: 2");
        expect(report).toContain("Invalid: 0");
        expect(report).not.toContain("Validation Errors:");
      });

      it("should generate report with errors", () => {
        const results: BatchValidationResult = {
          totalCount: 2,
          validCount: 1,
          invalidCount: 1,
          validRoles: [validRoleData],
          errors: [
            {
              index: 1,
              role: { id: "" },
              errors: [
                { path: "id", message: "Role ID cannot be empty" },
                { path: "name", message: "Role name is required" },
              ],
            },
          ],
        };

        const report = reportBatchValidationResults(results);
        expect(report).toContain("Total roles: 2");
        expect(report).toContain("Valid: 1");
        expect(report).toContain("Invalid: 1");
        expect(report).toContain("Validation Errors:");
        expect(report).toContain("Role 2:");
        expect(report).toContain("- Role ID cannot be empty");
        expect(report).toContain("- Role name is required");
      });
    });
  });
});
