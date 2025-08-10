import { z } from "zod";
import { formatRolesValidationErrors } from "../formatRolesValidationErrors";
import { persistedRolesSettingsSchema } from "../../../../types/settings/rolesSettingsSchema";

describe("formatRolesValidationErrors", () => {
  describe("field name formatting", () => {
    it("should format role field errors with friendly names", () => {
      // Test role field validation errors
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "",
            name: "a".repeat(101), // Too long
            description: "b".repeat(501), // Too long
            systemPrompt: "c".repeat(5001), // Too long
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // Check that we got all the expected errors
        expect(errors.length).toBeGreaterThan(0);

        // Check ID error
        const idError = errors.find((e) => e.path === "roles.0.id");
        expect(idError).toBeDefined();
        expect(idError?.message).toContain("Role 1 role id");
        expect(idError?.message).toContain("must have a value");

        // Check name error
        const nameError = errors.find((e) => e.path === "roles.0.name");
        expect(nameError).toBeDefined();
        expect(nameError?.message).toContain("Role 1 role name");
        expect(nameError?.message).toContain("100 characters");

        // Check description error
        const descError = errors.find((e) => e.path === "roles.0.description");
        expect(descError).toBeDefined();
        expect(descError?.message).toContain("Role 1 role description");
        expect(descError?.message).toContain("500 characters");

        // Check system prompt error
        const promptError = errors.find(
          (e) => e.path === "roles.0.systemPrompt",
        );
        expect(promptError).toBeDefined();
        expect(promptError?.message).toContain("Role 1 system prompt");
        expect(promptError?.message).toContain("5000 characters");
      }
    });

    it("should format top-level field errors with friendly names", () => {
      const invalidData = {
        schemaVersion: "", // Empty
        roles: "not-an-array", // Wrong type
        lastUpdated: "invalid-date", // Invalid date
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // Check schema version error
        const versionError = errors.find((e) => e.path === "schemaVersion");
        expect(versionError).toBeDefined();
        expect(versionError?.message).toContain("Schema version");

        // Check roles array error
        const rolesError = errors.find((e) => e.path === "roles");
        expect(rolesError).toBeDefined();
        expect(rolesError?.message).toContain("Roles list");
      }
    });
  });

  describe("enhanced error messages", () => {
    it("should provide actionable guidance for length validation errors", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test-id",
            name: "a".repeat(101),
            description: "valid description",
            systemPrompt: "valid prompt",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);
        const nameError = errors.find((e) => e.path === "roles.0.name");

        expect(nameError?.message).toContain("100 characters");
        expect(nameError?.message).toContain("Please shorten the text");
      }
    });

    it("should provide clear messages for required field errors", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "",
            name: "",
            description: "valid description",
            systemPrompt: "valid prompt",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        const idError = errors.find((e) => e.path === "roles.0.id");
        expect(idError?.message).toContain("Role 1 role id");
        expect(idError?.message).toContain("must have a value");

        const nameError = errors.find((e) => e.path === "roles.0.name");
        expect(nameError?.message).toContain("Role 1 role name");
        expect(nameError?.message).toContain("is required");
      }
    });

    it("should provide clear messages for type validation errors", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test-id",
            name: 123, // Wrong type
            description: true, // Wrong type
            systemPrompt: "valid prompt",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        const nameError = errors.find((e) => e.path === "roles.0.name");
        expect(nameError?.message).toContain("Role 1 role name");
        expect(nameError?.message).toContain("must be text");
        // The actual type received may vary based on validation order
        expect(nameError?.message).toMatch(/received (number|undefined)/);
      }
    });

    it("should handle datetime validation errors gracefully", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test-id",
            name: "Test Role",
            description: "Test description",
            systemPrompt: "Test prompt",
            createdAt: "invalid-date",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        const dateError = errors.find((e) => e.path === "roles.0.createdAt");
        expect(dateError?.message).toContain("Role 1 created timestamp");
        expect(dateError?.message).toContain("valid date/time format");
        expect(dateError?.message).toContain("ISO 8601");
      }
    });
  });

  describe("multiple roles", () => {
    it("should correctly number roles in error messages", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "role1",
            name: "", // Invalid
            description: "valid description",
            systemPrompt: "valid prompt",
          },
          {
            id: "role2",
            name: "Valid Role",
            description: "b".repeat(501), // Invalid
            systemPrompt: "valid prompt",
          },
          {
            id: "role3",
            name: "Another Valid Role",
            description: "valid description",
            systemPrompt: "c".repeat(5001), // Invalid
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // Check role numbering is correct
        const role1Error = errors.find((e) => e.path === "roles.0.name");
        expect(role1Error?.message).toContain("Role 1");

        const role2Error = errors.find((e) => e.path === "roles.1.description");
        expect(role2Error?.message).toContain("Role 2");

        const role3Error = errors.find(
          (e) => e.path === "roles.2.systemPrompt",
        );
        expect(role3Error?.message).toContain("Role 3");
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty error issues", () => {
      const mockError = new z.ZodError([]);
      const errors = formatRolesValidationErrors(mockError);
      expect(errors).toEqual([]);
    });

    it("should handle errors with no path using real validation", () => {
      // Test with invalid root-level data to get a real ZodError with empty path
      const invalidData = null;
      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);
        expect(errors.length).toBeGreaterThan(0);

        // Should have at least one error with root path
        const rootError = errors.find((e) => e.path === "root");
        expect(rootError).toBeDefined();
      }
    });

    it("should preserve original error structure", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test-id",
            name: "", // This will generate a real validation error
            description: "valid description",
            systemPrompt: "valid prompt",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // Should maintain path structure
        expect(errors.every((e) => typeof e.path === "string")).toBe(true);
        expect(errors.every((e) => typeof e.message === "string")).toBe(true);
        expect(errors.every((e) => e.message.length > 0)).toBe(true);
      }
    });
  });

  describe("comprehensive error scenarios", () => {
    it("should format all possible field validation errors", () => {
      const comprehensiveInvalidData = {
        schemaVersion: "", // Empty required field
        roles: [
          {
            id: "", // Empty ID
            name: "a".repeat(101), // Exceeds limit
            description: "b".repeat(501), // Exceeds limit
            systemPrompt: "c".repeat(5001), // Exceeds limit
            createdAt: "invalid-date", // Invalid format
            updatedAt: "2025-13-45T25:99:99.000Z", // Invalid date
          },
          {
            id: 123, // Wrong type
            name: true, // Wrong type
            description: [], // Wrong type
            systemPrompt: {}, // Wrong type
          },
        ],
        lastUpdated: null, // Wrong type
      };

      const result = persistedRolesSettingsSchema.safeParse(
        comprehensiveInvalidData,
      );
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // Should have errors for all invalid fields
        expect(errors.length).toBeGreaterThanOrEqual(10);

        // Check specific error messages
        expect(errors).toContainEqual(
          expect.objectContaining({
            path: "schemaVersion",
            message: expect.stringContaining("Schema version"),
          }),
        );

        expect(errors).toContainEqual(
          expect.objectContaining({
            path: "roles.0.id",
            message: expect.stringContaining("Role 1 role id"),
          }),
        );

        // Check role 2 type errors
        const role2IdError = errors.find((e) => e.path === "roles.1.id");
        expect(role2IdError?.message).toContain("Role 2 role id");
        expect(role2IdError?.message).toContain("must be text");

        const role2NameError = errors.find((e) => e.path === "roles.1.name");
        expect(role2NameError?.message).toContain("Role 2 role name");
        expect(role2NameError?.message).toContain("must be text");
      }
    });

    it("should handle deeply nested validation errors", () => {
      // Test with custom nested schema to simulate complex nested errors
      const nestedSchema = z.object({
        roles: z.array(
          z.object({
            id: z.string().min(1),
            metadata: z.object({
              tags: z.array(z.string().min(1)),
              settings: z.object({
                priority: z.number().min(1).max(10),
                category: z.string().min(1),
              }),
            }),
          }),
        ),
      });

      const invalidNestedData = {
        roles: [
          {
            id: "valid-id",
            metadata: {
              tags: ["", "valid-tag"], // Empty string in array
              settings: {
                priority: 15, // Exceeds max
                category: "", // Empty string
              },
            },
          },
        ],
      };

      const result = nestedSchema.safeParse(invalidNestedData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // Should handle nested paths correctly
        expect(errors.some((e) => e.path.includes("metadata.tags"))).toBe(true);
        expect(
          errors.some((e) => e.path.includes("metadata.settings.priority")),
        ).toBe(true);
        expect(
          errors.some((e) => e.path.includes("metadata.settings.category")),
        ).toBe(true);

        // Check path formatting for nested structures
        const tagError = errors.find((e) => e.path.includes("metadata.tags.0"));
        expect(tagError).toBeDefined();
        expect(tagError?.message).toContain(
          "expected string to have >=1 characters",
        );
      }
    });

    it("should handle array index errors correctly", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          { id: "valid1", name: "Valid", description: "", systemPrompt: "" },
          { id: "", name: "Invalid Role", description: "", systemPrompt: "" }, // Invalid
          {
            id: "valid3",
            name: "Another Valid",
            description: "",
            systemPrompt: "",
          },
          {
            id: "valid4",
            name: "a".repeat(101),
            description: "",
            systemPrompt: "",
          }, // Invalid
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // Should correctly identify roles by index
        const role2Error = errors.find((e) => e.path === "roles.1.id");
        expect(role2Error?.message).toContain("Role 2"); // 1-indexed

        const role4Error = errors.find((e) => e.path === "roles.3.name");
        expect(role4Error?.message).toContain("Role 4"); // 1-indexed
      }
    });
  });

  describe("error message clarity and consistency", () => {
    it("should provide actionable guidance for each error type", () => {
      const testCases = [
        {
          data: {
            roles: [
              {
                id: "test",
                name: "a".repeat(101),
                description: "",
                systemPrompt: "",
              },
            ],
          },
          expectedPattern: /cannot exceed.*100.*characters.*shorten/i,
        },
        {
          data: {
            roles: [
              { id: "", name: "Valid", description: "", systemPrompt: "" },
            ],
          },
          expectedPattern: /must have a value|cannot be empty/i,
        },
        {
          data: {
            roles: [
              {
                id: "test",
                name: "Valid",
                description: "",
                systemPrompt: "",
                createdAt: "not-a-date",
              },
            ],
          },
          expectedPattern: /valid date.*time.*ISO/i,
        },
      ];

      testCases.forEach(({ data, expectedPattern }, index) => {
        const fullData = {
          schemaVersion: "1.0.0",
          ...data,
          lastUpdated: new Date().toISOString(),
        };

        const result = persistedRolesSettingsSchema.safeParse(fullData);
        if (!result.success) {
          const errors = formatRolesValidationErrors(result.error);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0]?.message).toMatch(expectedPattern);
        } else {
          throw new Error(`Test case ${index} should have failed validation`);
        }
      });
    });

    it("should maintain consistent error message format across all fields", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test-role",
            name: "a".repeat(101), // Too long
            description: "b".repeat(501), // Too long
            systemPrompt: "c".repeat(5001), // Too long
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // All character limit errors should follow same pattern
        const characterLimitErrors = errors.filter(
          (e) =>
            e.message.includes("cannot exceed") &&
            e.message.includes("characters"),
        );

        expect(characterLimitErrors.length).toBe(3); // name, description, systemPrompt

        characterLimitErrors.forEach((error) => {
          expect(error.message).toMatch(
            /Role \d+ .* cannot exceed \d+ characters\. Please shorten the text\./,
          );
        });
      }
    });

    it("should provide helpful context for type validation errors", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: 123, // Wrong type - number instead of string
            name: true, // Wrong type - boolean instead of string
            description: [], // Wrong type - array instead of string
            systemPrompt: { text: "prompt" }, // Wrong type - object instead of string
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // All type errors should mention expected vs received type
        const typeErrors = errors.filter((e) =>
          e.message.includes("must be text"),
        );
        expect(typeErrors.length).toBeGreaterThan(0);

        typeErrors.forEach((error) => {
          expect(error.message).toMatch(/must be text.*received/i);
        });
      }
    });
  });

  describe("special characters and unicode", () => {
    it("should handle special characters in error messages", () => {
      const specialCharData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "test",
            name: "🎭 Theatre Director 演员 المخرج".repeat(10), // Unicode exceeding limit
            description: "Valid",
            systemPrompt: "Valid",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = persistedRolesSettingsSchema.safeParse(specialCharData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);
        const nameError = errors.find((e) => e.path === "roles.0.name");
        expect(nameError?.message).toContain("100 characters");
        expect(nameError?.path).toBe("roles.0.name");

        // Error message should be readable despite unicode content
        expect(nameError?.message).toMatch(
          /Role 1 role name cannot exceed 100 characters/,
        );
      }
    });

    it("should handle control characters and null bytes safely", () => {
      const controlCharData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "control-test",
            name: "Role\x00\x01\x02".repeat(30), // Control chars exceeding limit
            description: "Valid",
            systemPrompt: "Valid",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = persistedRolesSettingsSchema.safeParse(controlCharData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);
        const nameError = errors.find((e) => e.path === "roles.0.name");
        expect(nameError?.message).toContain("100 characters");

        // Should not crash on control characters
        expect(nameError?.message).toBeDefined();
        expect(typeof nameError?.message).toBe("string");
      }
    });

    it("should handle emoji and multi-byte characters correctly", () => {
      const emojiData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "emoji-test",
            name: "🚀🎯🔥⭐🌟💫✨🎨🎭🎪".repeat(15), // Emojis exceeding limit
            description: "Valid description",
            systemPrompt: "Valid system prompt",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = persistedRolesSettingsSchema.safeParse(emojiData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);
        const nameError = errors.find((e) => e.path === "roles.0.name");
        expect(nameError?.message).toContain("100 characters");
        expect(nameError?.message).toContain("Role 1 role name");

        // Should handle emojis without breaking
        expect(nameError?.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe("error message internationalization readiness", () => {
    it("should generate error messages that are i18n-ready", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        roles: [
          {
            id: "",
            name: "a".repeat(101),
            description: "b".repeat(501),
            systemPrompt: "c".repeat(5001),
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const result = persistedRolesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = formatRolesValidationErrors(result.error);

        // Error messages should be complete sentences
        errors.forEach((error) => {
          expect(error.message).toMatch(/^[A-Z].*[.!]$/); // Start with capital, end with punctuation
          expect(error.message).not.toMatch(/\{.*\}/); // No template placeholders
          expect(error.message.length).toBeGreaterThan(10); // Substantial message
        });

        // Messages should contain actionable information
        const characterLimitErrors = errors.filter((e) =>
          e.message.includes("characters"),
        );
        characterLimitErrors.forEach((error) => {
          expect(error.message).toMatch(/\d+/); // Contains actual numbers
          expect(error.message).toMatch(/shorten|reduce|limit/i); // Contains action words
        });
      }
    });
  });
});
