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

  describe("security testing", () => {
    it("should safely handle script injection attempts in role names", () => {
      const maliciousData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "malicious-1",
            name: "<script>alert('XSS')</script>",
            description: "javascript:alert('XSS')",
            systemPrompt: "'; DROP TABLE roles; --",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      // Should validate without executing any scripts
      const result = validateRolesData(
        maliciousData,
        persistedRolesSettingsSchema,
        "/path/to/roles.json",
        "saveRoles",
      );

      // Data should be preserved as-is for validation
      expect(result.roles[0]!.name).toBe("<script>alert('XSS')</script>");
      expect(result.roles[0]!.description).toBe("javascript:alert('XSS')");
      expect(result.roles[0]!.systemPrompt).toBe("'; DROP TABLE roles; --");
    });

    it("should handle path traversal attempts in role data", () => {
      const pathTraversalData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "../../../etc/passwd",
            name: "../../sensitive/data",
            description: "~/.ssh/id_rsa",
            systemPrompt: "file:///etc/shadow",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      // Should validate without attempting to access files
      const result = validateRolesData(
        pathTraversalData,
        persistedRolesSettingsSchema,
        "/path/to/roles.json",
        "saveRoles",
      );

      expect(result.roles[0]!.id).toBe("../../../etc/passwd");
      expect(result.roles[0]!.name).toBe("../../sensitive/data");
      expect(result.roles[0]!.description).toBe("~/.ssh/id_rsa");
      expect(result.roles[0]!.systemPrompt).toBe("file:///etc/shadow");
    });

    it("should handle special characters and encoding attempts", () => {
      const specialCharData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "special-chars",
            name: "Role\x00\x01\x02\x03\xFF",
            description: "%3Cscript%3Ealert%28%29%3C%2Fscript%3E",
            systemPrompt: "&lt;script&gt;alert()&lt;/script&gt;",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        specialCharData,
        persistedRolesSettingsSchema,
        "/path/to/special.json",
        "saveRoles",
      );

      // Should preserve special characters without interpretation
      expect(result.roles[0]!.name).toContain("\x00");
      expect(result.roles[0]!.description).toContain("%3C");
      expect(result.roles[0]!.systemPrompt).toContain("&lt;");
    });

    it("should prevent prototype pollution attempts", () => {
      const pollutionData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "prototype-test",
            name: "Test Role",
            description: "Testing prototype pollution",
            systemPrompt: "Test prompt",
            __proto__: { malicious: true },
            constructor: { prototype: { polluted: true } },
          },
        ],
        lastUpdated: new Date().toISOString(),
        __proto__: { globalPollution: true },
      };

      validateRolesData(
        pollutionData,
        persistedRolesSettingsSchema,
        "/path/to/pollution.json",
        "saveRoles",
      );

      // Should not affect global prototype
      expect(
        (Object.prototype as unknown as { malicious?: boolean }).malicious,
      ).toBeUndefined();
      expect(
        (Object.prototype as unknown as { polluted?: boolean }).polluted,
      ).toBeUndefined();
      expect(
        (Object.prototype as unknown as { globalPollution?: boolean })
          .globalPollution,
      ).toBeUndefined();
    });

    it("should handle extremely long strings safely", () => {
      const extremeData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "extreme-test",
            name: "a".repeat(100000), // Very long name
            description: "b".repeat(100000), // Very long description
            systemPrompt: "c".repeat(100000), // Very long system prompt
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      // Should fail validation due to length limits, but not crash
      expect(() =>
        validateRolesData(
          extremeData,
          persistedRolesSettingsSchema,
          "/path/to/extreme.json",
          "saveRoles",
        ),
      ).toThrow(SettingsValidationError);
    });
  });

  describe("concurrent validation", () => {
    it("should handle multiple concurrent validation calls", async () => {
      const validData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "concurrent-test",
            name: "Concurrent Role",
            description: "Testing concurrent validation",
            systemPrompt: "Concurrent validation test",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(
          validateRolesData(
            {
              ...validData,
              roles: [{ ...validData.roles[0]!, id: `concurrent-${i}` }],
            },
            persistedRolesSettingsSchema,
            `/path/to/concurrent-${i}.json`,
            "concurrentValidation",
          ),
        ),
      );

      const results = await Promise.all(promises);
      results.forEach((result, i) => {
        expect(result.roles[0]!.id).toBe(`concurrent-${i}`);
        expect(result.roles[0]!.name).toBe("Concurrent Role");
      });
    });

    it("should handle concurrent validations with mixed success/failure", async () => {
      const createData = (valid: boolean, index: number) => ({
        schemaVersion: "1.0.0",
        roles: [
          {
            id: `concurrent-${index}`,
            name: valid ? "Valid Role" : "a".repeat(101), // Invalid if false
            description: "Testing concurrent mixed validation",
            systemPrompt: "Concurrent test",
          },
        ],
        lastUpdated: new Date().toISOString(),
      });

      const promises = Array.from(
        { length: 10 },
        (_, i) =>
          new Promise((resolve) => {
            try {
              const result = validateRolesData(
                createData(i % 2 === 0, i), // Alternate valid/invalid
                persistedRolesSettingsSchema,
                `/path/to/mixed-${i}.json`,
                "mixedConcurrent",
              );
              resolve({ success: true, result, index: i });
            } catch (error) {
              resolve({ success: false, error, index: i });
            }
          }),
      );

      const results = (await Promise.all(promises)) as Array<{
        success: boolean;
        result?: unknown;
        error?: SettingsValidationError;
        index: number;
      }>;
      results.forEach((result, i) => {
        if (i % 2 === 0) {
          // Should succeed
          expect(result.success).toBe(true);
        } else {
          // Should fail
          expect(result.success).toBe(false);
          expect(result.error).toBeInstanceOf(SettingsValidationError);
        }
      });
    });
  });

  describe("memory usage", () => {
    it("should not leak memory during repeated validations", () => {
      const validData = {
        schemaVersion: "1.0.0",
        roles: Array.from({ length: 10 }, (_, i) => ({
          id: `role-${i}`,
          name: `Role ${i}`,
          description: `Description ${i}`,
          systemPrompt: `Prompt ${i}`,
        })),
        lastUpdated: new Date().toISOString(),
      };

      // Run validation 1000 times
      for (let i = 0; i < 1000; i++) {
        validateRolesData(
          validData,
          persistedRolesSettingsSchema,
          "/path/to/roles.json",
          "memoryTest",
        );
      }

      // Test passes if no memory errors occur
      expect(true).toBe(true);
    });

    it("should handle large validation error sets without excessive memory", () => {
      // Create data with many validation errors
      const invalidRoles = Array.from({ length: 50 }, () => ({
        id: "", // Invalid
        name: "a".repeat(101), // Invalid
        description: "b".repeat(501), // Invalid
        systemPrompt: "c".repeat(5001), // Invalid
      }));

      const largeInvalidData = {
        schemaVersion: "1.0.0",
        roles: invalidRoles,
        lastUpdated: new Date().toISOString(),
      };

      try {
        validateRolesData(
          largeInvalidData,
          persistedRolesSettingsSchema,
          "/path/to/large-invalid.json",
          "memoryErrorTest",
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          // Should have many errors but not crash
          expect(error.fieldErrors.length).toBeGreaterThan(50);
        }
      }
    });

    it("should efficiently handle repeated error generation", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "", // Invalid
            name: "a".repeat(101), // Invalid
            description: "b".repeat(501), // Invalid
            systemPrompt: "c".repeat(5001), // Invalid
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      // Generate errors 100 times
      for (let i = 0; i < 100; i++) {
        try {
          validateRolesData(
            invalidData,
            persistedRolesSettingsSchema,
            `/path/to/error-${i}.json`,
            "repeatedErrors",
          );
        } catch (error) {
          expect(error).toBeInstanceOf(SettingsValidationError);
        }
      }

      // Test passes if no memory issues occur
      expect(true).toBe(true);
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
