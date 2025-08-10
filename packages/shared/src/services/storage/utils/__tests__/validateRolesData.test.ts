import { z } from "zod";
import { SettingsValidationError } from "../../errors/SettingsValidationError";
import { validateRolesData } from "../validateRolesData";
import { persistedRolesSettingsSchema } from "../../../../types/settings/rolesSettingsSchema";

describe("validateRolesData", () => {
  describe("successful validation", () => {
    it("should validate complete roles data with all fields", () => {
      const validData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Assistant",
            description: "A helpful AI assistant",
            systemPrompt: "You are a helpful assistant",
            createdAt: "2025-01-15T10:00:00.000Z",
            updatedAt: "2025-01-15T10:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/roles.json";

      const result = validateRolesData(
        validData,
        persistedRolesSettingsSchema,
        filePath,
        "loadRoles",
      );

      expect(result).toEqual(validData);
      expect(result.roles).toHaveLength(1);
      expect(result.roles[0]!.name).toBe("Assistant");
    });

    it("should handle null timestamps gracefully", () => {
      const dataWithNullTimestamps = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Editor",
            description: "Code editor role",
            systemPrompt: "You are a code editor",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/roles.json";

      const result = validateRolesData(
        dataWithNullTimestamps,
        persistedRolesSettingsSchema,
        filePath,
        "loadRoles",
      );

      expect(result.roles[0]!.createdAt).toBeNull();
      expect(result.roles[0]!.updatedAt).toBeNull();
    });

    it("should handle missing optional timestamps", () => {
      const dataWithoutTimestamps = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Reviewer",
            description: "Code reviewer",
            systemPrompt: "Review code for quality",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/roles.json";

      const result = validateRolesData(
        dataWithoutTimestamps,
        persistedRolesSettingsSchema,
        filePath,
        "loadRoles",
      );

      expect(result.roles[0]!.createdAt).toBeUndefined();
      expect(result.roles[0]!.updatedAt).toBeUndefined();
    });

    it("should validate empty roles array", () => {
      const emptyRolesData = {
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/roles.json";

      const result = validateRolesData(
        emptyRolesData,
        persistedRolesSettingsSchema,
        filePath,
        "initializeRoles",
      );

      expect(result.roles).toEqual([]);
    });

    it("should allow additional fields via passthrough", () => {
      const dataWithExtraFields = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Assistant",
            description: "Helper",
            systemPrompt: "Help users",
            futureField: "future-value",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
        customMetadata: { key: "value" },
      };
      const filePath = "/path/to/roles.json";

      const result = validateRolesData(
        dataWithExtraFields,
        persistedRolesSettingsSchema,
        filePath,
        "loadRoles",
      );

      expect(result).toMatchObject(dataWithExtraFields);
    });

    it("should handle empty description and systemPrompt", () => {
      const dataWithEmptyOptionals = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Minimal Role",
            description: "",
            systemPrompt: "",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/roles.json";

      const result = validateRolesData(
        dataWithEmptyOptionals,
        persistedRolesSettingsSchema,
        filePath,
        "loadRoles",
      );

      expect(result.roles[0]!.description).toBe("");
      expect(result.roles[0]!.systemPrompt).toBe("");
    });

    it("should apply schema defaults", () => {
      const dataWithDefaults = {};
      const filePath = "/path/to/roles.json";

      const result = validateRolesData(
        dataWithDefaults,
        persistedRolesSettingsSchema,
        filePath,
        "initializeRoles",
      );

      expect(result.schemaVersion).toBe("1.0.0");
      expect(result.roles).toEqual([]);
      expect(result.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  describe("validation failures", () => {
    it("should throw SettingsValidationError for missing required fields", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            // Missing required 'id' and 'name'
            description: "Invalid role",
            systemPrompt: "Test",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/invalid-roles.json";

      expect(() =>
        validateRolesData(
          invalidData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validateRolesData(
          invalidData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe("loadRoles");
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.0.id",
              message: "Role ID must be a string",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.0.name",
              message: "Role name must be a string",
            }),
          );
        }
      }
    });

    it("should validate character limits", () => {
      const dataExceedingLimits = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "a".repeat(101), // Exceeds 100 char limit
            description: "b".repeat(501), // Exceeds 500 char limit
            systemPrompt: "c".repeat(5001), // Exceeds 5000 char limit
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/roles.json";

      expect(() =>
        validateRolesData(
          dataExceedingLimits,
          persistedRolesSettingsSchema,
          filePath,
          "saveRoles",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validateRolesData(
          dataExceedingLimits,
          persistedRolesSettingsSchema,
          filePath,
          "saveRoles",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.0.name",
              message: "Role name cannot exceed 100 characters",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.0.description",
              message: "Role description cannot exceed 500 characters",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.0.systemPrompt",
              message: "System prompt cannot exceed 5000 characters",
            }),
          );
        }
      }
    });

    it("should validate timestamp formats", () => {
      const invalidTimestampData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Test Role",
            description: "Test",
            systemPrompt: "Test",
            createdAt: "not-a-valid-date",
            updatedAt: "2025-13-45T25:99:99.000Z", // Invalid date
          },
        ],
        lastUpdated: "invalid-date",
      };
      const filePath = "/path/to/roles.json";

      expect(() =>
        validateRolesData(
          invalidTimestampData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validateRolesData(
          invalidTimestampData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(
            error.fieldErrors.some(
              (e) =>
                e.path.includes("createdAt") &&
                e.message.includes("valid ISO datetime"),
            ),
          ).toBe(true);
          expect(
            error.fieldErrors.some(
              (e) =>
                e.path.includes("updatedAt") &&
                e.message.includes("valid ISO datetime"),
            ),
          ).toBe(true);
          expect(
            error.fieldErrors.some(
              (e) =>
                e.path === "lastUpdated" &&
                e.message.includes("valid ISO datetime"),
            ),
          ).toBe(true);
        }
      }
    });

    it("should handle malformed data structure", () => {
      const malformedData = {
        schemaVersion: "1.0.0",
        roles: "not-an-array", // Should be array
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/roles.json";

      expect(() =>
        validateRolesData(
          malformedData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validateRolesData(
          malformedData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles",
              message: "Roles must be an array of role objects",
            }),
          );
        }
      }
    });

    it("should handle empty required strings", () => {
      const emptyStringsData = {
        schemaVersion: "",
        roles: [
          {
            id: "",
            name: "",
            description: "",
            systemPrompt: "",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/roles.json";

      expect(() =>
        validateRolesData(
          emptyStringsData,
          persistedRolesSettingsSchema,
          filePath,
          "saveRoles",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validateRolesData(
          emptyStringsData,
          persistedRolesSettingsSchema,
          filePath,
          "saveRoles",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "schemaVersion",
              message: "Schema version cannot be empty",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.0.id",
              message: "Role ID cannot be empty",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.0.name",
              message: "Role name is required",
            }),
          );
        }
      }
    });

    it("should handle wrong data types", () => {
      const wrongTypeData = {
        schemaVersion: 123, // Should be string
        roles: [
          {
            id: 456, // Should be string
            name: true, // Should be string
            description: [], // Should be string
            systemPrompt: {}, // Should be string
          },
        ],
        lastUpdated: false, // Should be string
      };
      const filePath = "/path/to/roles.json";

      expect(() =>
        validateRolesData(
          wrongTypeData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validateRolesData(
          wrongTypeData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "schemaVersion",
              message: "Schema version must be a string",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.0.id",
              message: "Role ID must be a string",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.0.name",
              message: "Role name must be a string",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "lastUpdated",
              message: "Last updated must be an ISO timestamp string",
            }),
          );
        }
      }
    });

    it("should provide correct file path and operation in errors", () => {
      const invalidData = { invalid: "structure" };
      const filePath = "/custom/path/to/roles.json";
      const operation = "customOperation";

      try {
        validateRolesData(
          invalidData,
          persistedRolesSettingsSchema,
          filePath,
          operation,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe(operation);
        }
      }
    });

    it("should handle unexpected errors gracefully", () => {
      // Create a schema that will throw an unexpected error
      const throwingSchema = z.custom(() => {
        throw new Error("Unexpected internal error");
      });

      const filePath = "/path/to/roles.json";
      const operation = "testOperation";

      try {
        validateRolesData({}, throwingSchema, filePath, operation);
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe(operation);
          expect(error.fieldErrors).toHaveLength(1);
          expect(error.fieldErrors[0]).toEqual({
            path: "root",
            message: expect.stringContaining("Unexpected validation error"),
          });
        }
      }
    });
  });

  describe("edge cases", () => {
    it("should handle very large valid roles arrays", () => {
      const largeRolesArray = Array.from({ length: 100 }, (_, i) => ({
        id: `role-${i}`,
        name: `Role ${i}`,
        description: `Description for role ${i}`,
        systemPrompt: `System prompt for role ${i}`,
      }));

      const largeData = {
        schemaVersion: "1.0.0",
        roles: largeRolesArray,
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/large-roles.json";

      const result = validateRolesData(
        largeData,
        persistedRolesSettingsSchema,
        filePath,
        "loadRoles",
      );

      expect(result.roles).toHaveLength(100);
    });

    it("should handle unicode characters in role fields", () => {
      const unicodeData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-unicode",
            name: "🎭 Theatre Director",
            description: "导演 • Директор • المخرج",
            systemPrompt: "You are a theatre director. 🎬",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/unicode-roles.json";

      const result = validateRolesData(
        unicodeData,
        persistedRolesSettingsSchema,
        filePath,
        "loadRoles",
      );

      expect(result.roles[0]!.name).toBe("🎭 Theatre Director");
      expect(result.roles[0]!.description).toContain("导演");
    });

    it("should validate using custom role schema", () => {
      const customSchema = z.object({
        id: z.string(),
        customField: z.number(),
      });

      const customData = {
        id: "custom-1",
        customField: 42,
      };
      const filePath = "/path/to/custom.json";

      const result = validateRolesData(
        customData,
        customSchema,
        filePath,
        "customValidation",
      );

      expect(result.customField).toBe(42);
    });

    it("should handle multiple roles with mixed validity", () => {
      const mixedValidityData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role-1",
            name: "Valid Role",
            description: "This is valid",
            systemPrompt: "Valid prompt",
          },
          {
            id: "", // Invalid - empty
            name: "a".repeat(101), // Invalid - too long
            description: "Valid description",
            systemPrompt: "Valid prompt",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/mixed-roles.json";

      expect(() =>
        validateRolesData(
          mixedValidityData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validateRolesData(
          mixedValidityData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.1.id",
              message: "Role ID cannot be empty",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "roles.1.name",
              message: "Role name cannot exceed 100 characters",
            }),
          );
        }
      }
    });
  });

  describe("error context", () => {
    it("should include file path in error context", () => {
      const invalidData = { roles: "not-an-array" };
      const filePath = "/context/test.json";

      try {
        validateRolesData(
          invalidData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe("loadRoles");
          expect(error.message).toContain("Settings validation failed");
        }
      }
    });

    it("should handle empty file path", () => {
      const invalidData = { roles: "not-an-array" };
      const filePath = "";

      try {
        validateRolesData(
          invalidData,
          persistedRolesSettingsSchema,
          filePath,
          "loadRoles",
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe("");
          expect(error.operation).toBe("loadRoles");
        }
      }
    });

    it("should handle various operation contexts", () => {
      const operations = [
        "loadRoles",
        "saveRoles",
        "updateRoles",
        "initializeRoles",
      ];
      const invalidData = { roles: "invalid" };

      operations.forEach((operation) => {
        try {
          validateRolesData(
            invalidData,
            persistedRolesSettingsSchema,
            "/test.json",
            operation,
          );
        } catch (error) {
          if (error instanceof SettingsValidationError) {
            expect(error.operation).toBe(operation);
          }
        }
      });
    });
  });

  describe("integration with validateWithSchema", () => {
    it("should properly delegate to validateWithSchema", () => {
      const validData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "integration-test",
            name: "Integration Role",
            description: "Testing integration",
            systemPrompt: "Integration test prompt",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = validateRolesData(
        validData,
        persistedRolesSettingsSchema,
        "/integration.json",
        "test",
      );
      expect(result).toEqual(validData);
    });

    it("should preserve error details from validateWithSchema", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test-role",
            name: "a".repeat(101), // Exceeds limit
            description: "b".repeat(501), // Exceeds limit
            systemPrompt: "Valid prompt",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      try {
        validateRolesData(
          invalidData,
          persistedRolesSettingsSchema,
          "/preserve-errors.json",
          "test",
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toHaveLength(2);
          expect(error.fieldErrors).toContainEqual({
            path: "roles.0.name",
            message: "Role name cannot exceed 100 characters",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "roles.0.description",
            message: "Role description cannot exceed 500 characters",
          });
        }
      }
    });
  });
});
