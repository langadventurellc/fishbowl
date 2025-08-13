import { validateRolesData } from "../validateRolesData";
import { persistedRolesSettingsSchema } from "../../../../types/settings/rolesSettingsSchema";
import { SettingsValidationError } from "../../errors/SettingsValidationError";

describe("Roles Validation Boundary Tests", () => {
  describe("character limit boundaries", () => {
    it("should accept fields at exact character limits", () => {
      const boundaryData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "boundary-test",
            name: "a".repeat(100), // Exactly 100 chars
            description: "b".repeat(500), // Exactly 500 chars
            systemPrompt: "c".repeat(5000), // Exactly 5000 chars
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        boundaryData,
        persistedRolesSettingsSchema,
        "/path/to/boundary.json",
        "test",
      );

      expect(result.roles[0]!.name.length).toBe(100);
      expect(result.roles[0]!.description.length).toBe(500);
      expect(result.roles[0]!.systemPrompt.length).toBe(5000);
    });

    it("should reject fields exceeding limits by one character", () => {
      const overLimitData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "over-limit",
            name: "a".repeat(101), // 101 chars
            description: "b".repeat(501), // 501 chars
            systemPrompt: "c".repeat(5001), // 5001 chars
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      expect(() =>
        validateRolesData(
          overLimitData,
          persistedRolesSettingsSchema,
          "/path/to/overlimit.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);
    });

    it("should accept minimum valid field lengths", () => {
      const minData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "a", // 1 char
            name: "b", // 1 char
            description: "", // 0 chars (allowed)
            systemPrompt: "a", // 1 char (minimum required)
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        minData,
        persistedRolesSettingsSchema,
        "/path/to/min.json",
        "test",
      );

      expect(result.roles[0]!.id).toBe("a");
      expect(result.roles[0]!.name).toBe("b");
    });

    it("should reject empty required fields", () => {
      const emptyRequiredData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "", // Empty required field
            name: "", // Empty required field
            description: "",
            systemPrompt: "",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      expect(() =>
        validateRolesData(
          emptyRequiredData,
          persistedRolesSettingsSchema,
          "/path/to/empty.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);
    });
  });

  describe("array size boundaries", () => {
    it("should handle empty roles array", () => {
      const emptyData = {
        schemaVersion: "1.0.0",
        roles: [],
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        emptyData,
        persistedRolesSettingsSchema,
        "/path/to/empty.json",
        "test",
      );

      expect(result.roles).toEqual([]);
    });

    it("should handle single role", () => {
      const singleRoleData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "single",
            name: "Single Role",
            description: "Only role",
            systemPrompt: "Single prompt",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        singleRoleData,
        persistedRolesSettingsSchema,
        "/path/to/single.json",
        "test",
      );

      expect(result.roles.length).toBe(1);
      expect(result.roles[0]!.name).toBe("Single Role");
    });

    it("should handle large roles arrays", () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => ({
        id: `role-${i}`,
        name: `Role ${i}`,
        description: `Description ${i}`,
        systemPrompt: `Prompt ${i}`,
      }));

      const largeData = {
        schemaVersion: "1.0.0",
        roles: largeArray,
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        largeData,
        persistedRolesSettingsSchema,
        "/path/to/large.json",
        "test",
      );

      expect(result.roles.length).toBe(100);
      expect(result.roles[0]!.name).toBe("Role 0");
      expect(result.roles[99]!.name).toBe("Role 99");
    });
  });

  describe("timestamp boundaries", () => {
    it("should accept various valid ISO datetime formats", () => {
      // Test individual timestamps to identify which ones are failing
      const validTimestamps = [
        "2025-01-15T10:30:00.000Z",
        "2025-01-15T10:30:00Z",
        "2000-01-01T00:00:00.000Z",
        "2025-12-31T23:59:59.999Z",
      ];

      validTimestamps.forEach((timestamp, index) => {
        const data = {
          schemaVersion: "1.0.0",
          roles: [
            {
              id: `timestamp-test-${index}`,
              name: "Test",
              description: "Test",
              systemPrompt: "Test",
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
          lastUpdated: timestamp,
        };

        const result = validateRolesData(
          data,
          persistedRolesSettingsSchema,
          "/path/to/timestamp.json",
          "test",
        );

        expect(result.roles[0]!.createdAt).toBe(timestamp);
        expect(result.lastUpdated).toBe(timestamp);
      });
    });

    it("should reject invalid timestamp formats", () => {
      const invalidTimestamps = [
        "2025-01-15", // Date only
        "10:30:00", // Time only
        "2025/01/15 10:30:00", // Wrong format
        "January 15, 2025", // Human readable
        "1234567890", // Unix timestamp
        "2025-13-01T00:00:00.000Z", // Invalid month
        "2025-01-32T00:00:00.000Z", // Invalid day
        "2025-01-15T25:00:00.000Z", // Invalid hour
        "2025-01-15T10:60:00.000Z", // Invalid minute
        "2025-01-15T10:30:60.000Z", // Invalid second
      ];

      invalidTimestamps.forEach((timestamp, index) => {
        const data = {
          schemaVersion: "1.0.0",
          roles: [
            {
              id: `invalid-timestamp-${index}`,
              name: "Test",
              description: "Test",
              systemPrompt: "Test",
              createdAt: timestamp,
            },
          ],
          lastUpdated: new Date().toISOString(),
        };

        expect(() =>
          validateRolesData(
            data,
            persistedRolesSettingsSchema,
            "/path/to/invalid-timestamp.json",
            "test",
          ),
        ).toThrow(SettingsValidationError);
      });
    });

    it("should handle edge case dates", () => {
      const edgeCaseDates = [
        "2000-01-01T00:00:00.000Z", // Y2K
        "2038-01-19T03:14:07.000Z", // Unix timestamp limit
        "1970-01-01T00:00:00.000Z", // Unix epoch
        "2100-12-31T23:59:59.999Z", // Future date
      ];

      edgeCaseDates.forEach((timestamp) => {
        const data = {
          schemaVersion: "1.0.0",
          roles: [
            {
              id: "edge-case",
              name: "Edge Case Role",
              description: "Testing edge case dates",
              systemPrompt: "Edge case test",
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ],
          lastUpdated: timestamp,
        };

        const result = validateRolesData(
          data,
          persistedRolesSettingsSchema,
          "/path/to/edge-case.json",
          "test",
        );

        expect(result.roles[0]!.createdAt).toBe(timestamp);
        expect(result.lastUpdated).toBe(timestamp);
      });
    });
  });

  describe("null and undefined handling", () => {
    it("should distinguish between null and undefined timestamps", () => {
      const nullData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "null-test",
            name: "Null Test",
            description: "Testing null",
            systemPrompt: "Null timestamps",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const undefinedData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "undefined-test",
            name: "Undefined Test",
            description: "Testing undefined",
            systemPrompt: "No timestamps",
            // createdAt and updatedAt are undefined (not included)
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const nullResult = validateRolesData(
        nullData,
        persistedRolesSettingsSchema,
        "/path/to/null.json",
        "test",
      );

      const undefinedResult = validateRolesData(
        undefinedData,
        persistedRolesSettingsSchema,
        "/path/to/undefined.json",
        "test",
      );

      expect(nullResult.roles[0]!.createdAt).toBeNull();
      expect(nullResult.roles[0]!.updatedAt).toBeNull();
      expect(undefinedResult.roles[0]!.createdAt).toBeUndefined();
      expect(undefinedResult.roles[0]!.updatedAt).toBeUndefined();
    });

    it("should handle null values in non-nullable fields", () => {
      const nullInRequiredData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: null, // Null in required field
            name: null, // Null in required field
            description: "Valid",
            systemPrompt: "Valid",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      expect(() =>
        validateRolesData(
          nullInRequiredData,
          persistedRolesSettingsSchema,
          "/path/to/null-required.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);
    });

    it("should handle undefined in optional vs required fields", () => {
      // Valid case - undefined in optional fields
      const validUndefinedData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test",
            name: "Test Role",
            description: "Test",
            systemPrompt: "Test",
            // createdAt and updatedAt undefined (optional)
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        validUndefinedData,
        persistedRolesSettingsSchema,
        "/path/to/valid-undefined.json",
        "test",
      );

      expect(result.roles[0]!.createdAt).toBeUndefined();
      expect(result.roles[0]!.updatedAt).toBeUndefined();

      // Invalid case - missing required fields
      const invalidMissingData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            // id missing (required)
            // name missing (required)
            description: "Test",
            systemPrompt: "Test",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      expect(() =>
        validateRolesData(
          invalidMissingData,
          persistedRolesSettingsSchema,
          "/path/to/missing-required.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);
    });
  });

  describe("schema version boundaries", () => {
    it("should accept valid schema versions", () => {
      const validVersions = ["1.0.0", "2.0.0", "1.5.3", "10.0.0"];

      validVersions.forEach((version) => {
        const data = {
          schemaVersion: version,
          roles: [],
          lastUpdated: new Date().toISOString(),
        };

        const result = validateRolesData(
          data,
          persistedRolesSettingsSchema,
          "/path/to/version.json",
          "test",
        );

        expect(result.schemaVersion).toBe(version);
      });
    });

    it("should reject empty or invalid schema versions", () => {
      const invalidVersions = [""]; // Only empty string fails due to min(1) validation

      invalidVersions.forEach((version) => {
        const data = {
          schemaVersion: version,
          roles: [],
          lastUpdated: new Date().toISOString(),
        };

        expect(() =>
          validateRolesData(
            data,
            persistedRolesSettingsSchema,
            "/path/to/invalid-version.json",
            "test",
          ),
        ).toThrow(SettingsValidationError);
      });

      // Test null and non-string types separately
      const wrongTypeVersions = [null, 123, true, []];

      wrongTypeVersions.forEach((version) => {
        const data = {
          schemaVersion: version,
          roles: [],
          lastUpdated: new Date().toISOString(),
        };

        expect(() =>
          validateRolesData(
            data,
            persistedRolesSettingsSchema,
            "/path/to/wrong-type-version.json",
            "test",
          ),
        ).toThrow(SettingsValidationError);
      });
    });
  });

  describe("unicode and special character boundaries", () => {
    it("should handle unicode characters within limits", () => {
      const unicodeData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "unicode-test",
            name: "🎭 Theatre Director 演员 المخرج", // Mixed unicode
            description: "Supports 中文, العربية, 日本語, हिन्दी, русский", // Multi-language
            systemPrompt:
              "You are a multilingual assistant. 你好! مرحبا! こんにちは!",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        unicodeData,
        persistedRolesSettingsSchema,
        "/path/to/unicode.json",
        "test",
      );

      expect(result.roles[0]!.name).toContain("🎭");
      expect(result.roles[0]!.description).toContain("中文");
      expect(result.roles[0]!.systemPrompt).toContain("你好");
    });

    it("should reject unicode strings exceeding character limits", () => {
      const longUnicodeData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "long-unicode",
            name: "🚀".repeat(51), // 51 emojis = exceeds 100 char limit
            description: "Description",
            systemPrompt: "Prompt",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      expect(() =>
        validateRolesData(
          longUnicodeData,
          persistedRolesSettingsSchema,
          "/path/to/long-unicode.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);
    });

    it("should handle special characters and symbols", () => {
      const specialCharData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "special-chars",
            name: "Role@#$%^&*()_+-={}[]|;':\",./<>?",
            description: "Description with newlines\nand\ttabs",
            systemPrompt: 'System prompt with \\ backslashes and "quotes"',
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        specialCharData,
        persistedRolesSettingsSchema,
        "/path/to/special-chars.json",
        "test",
      );

      expect(result.roles[0]!.name).toContain("@#$%");
      expect(result.roles[0]!.description).toContain("\n");
      expect(result.roles[0]!.systemPrompt).toContain("\\");
    });

    it("should handle control characters safely", () => {
      const controlCharData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "control-test",
            name: "Role\x00\x01\x02\x03", // Control characters
            description: "Description\x0B\x0C", // Vertical tab, form feed
            systemPrompt: "Prompt\x7F", // DEL character
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = validateRolesData(
        controlCharData,
        persistedRolesSettingsSchema,
        "/path/to/control-chars.json",
        "test",
      );

      expect(result.roles[0]!.name).toContain("\x00");
      expect(result.roles[0]!.description).toContain("\x0B");
      expect(result.roles[0]!.systemPrompt).toContain("\x7F");
    });
  });

  describe("data type boundaries", () => {
    it("should reject wrong data types for required fields", () => {
      const wrongTypeData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: 123, // Should be string
            name: true, // Should be string
            description: [], // Should be string
            systemPrompt: {}, // Should be string
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      expect(() =>
        validateRolesData(
          wrongTypeData,
          persistedRolesSettingsSchema,
          "/path/to/wrong-types.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);
    });

    it("should reject wrong array types", () => {
      const wrongArrayTypeData = {
        schemaVersion: "1.0.0",
        roles: "not-an-array", // Should be array
        lastUpdated: new Date().toISOString(),
      };

      expect(() =>
        validateRolesData(
          wrongArrayTypeData,
          persistedRolesSettingsSchema,
          "/path/to/wrong-array.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);
    });

    it("should reject wrong timestamp types", () => {
      const wrongTimestampTypeData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test",
            name: "Test",
            description: "Test",
            systemPrompt: "Test",
            createdAt: 1640995200000, // Number instead of string
            updatedAt: true, // Boolean instead of string
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      expect(() =>
        validateRolesData(
          wrongTimestampTypeData,
          persistedRolesSettingsSchema,
          "/path/to/wrong-timestamp-types.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);
    });
  });

  describe("object structure boundaries", () => {
    it("should handle nested object validation", () => {
      const validNestedData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "nested-test",
            name: "Nested Test Role",
            description: "Testing nested validation",
            systemPrompt: "System prompt",
            createdAt: "2025-01-15T10:30:00.000Z",
            updatedAt: "2025-01-15T10:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = validateRolesData(
        validNestedData,
        persistedRolesSettingsSchema,
        "/path/to/nested.json",
        "test",
      );

      expect(result.roles[0]!.id).toBe("nested-test");
      expect(result.roles[0]!.createdAt).toBe("2025-01-15T10:30:00.000Z");
    });

    it("should handle partial object definitions", () => {
      const partialData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "partial-test",
            name: "Partial Role",
            // Missing description and systemPrompt - should get defaults or be invalid
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      expect(() =>
        validateRolesData(
          partialData,
          persistedRolesSettingsSchema,
          "/path/to/partial.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);
    });

    it("should handle extra unknown fields through passthrough", () => {
      const extraFieldsData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "extra-fields-test",
            name: "Extra Fields Role",
            description: "Testing extra fields",
            systemPrompt: "System prompt",
            // Extra fields that should be preserved
            category: "AI Assistant",
            tags: ["helpful", "creative"],
            priority: 5,
            metadata: {
              source: "user-created",
              version: "1.0",
            },
          },
        ],
        lastUpdated: new Date().toISOString(),
        // Extra top-level fields
        customConfig: {
          theme: "dark",
          language: "en",
        },
      };

      const result = validateRolesData(
        extraFieldsData,
        persistedRolesSettingsSchema,
        "/path/to/extra-fields.json",
        "test",
      );

      // Should preserve extra fields due to passthrough
      expect(result.roles[0]).toHaveProperty("category");
      expect(result.roles[0]).toHaveProperty("tags");
      expect(result).toHaveProperty("customConfig");
      expect(
        (result as { customConfig?: { theme?: string } }).customConfig?.theme,
      ).toBe("dark");
    });
  });
});
