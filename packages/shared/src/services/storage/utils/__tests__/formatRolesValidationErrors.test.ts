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
});
