import { recoverRoleFields } from "../recoverRoleFields";

describe("recoverRoleFields", () => {
  describe("input validation", () => {
    it("should return null for non-object input", () => {
      expect(recoverRoleFields("not an object", [])).toBeNull();
      expect(recoverRoleFields(123, [])).toBeNull();
      expect(recoverRoleFields(null, [])).toBeNull();
      expect(recoverRoleFields(undefined, [])).toBeNull();
    });

    it("should return null when no errors can be recovered", () => {
      const roleData = {
        id: "test-role",
        name: "Test Role",
        description: "Valid description",
        systemPrompt: "Valid prompt",
      };

      const result = recoverRoleFields(roleData, []);
      expect(result).toBeNull();
    });
  });

  describe("character limit violations", () => {
    it("should truncate fields that exceed character limits", () => {
      const roleData = {
        id: "test-role",
        name: "This is a very long name that exceeds the character limit",
        description: "Valid description",
        systemPrompt: "Valid prompt",
      };

      const fieldErrors = [
        { path: "name", message: "Name cannot exceed 100 characters" },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.name).toBe(
        "This is a very long name that exceeds the character limit".slice(
          0,
          100,
        ),
      );
    });

    it("should handle multiple character limit violations", () => {
      const roleData = {
        id: "test-role",
        name: "A".repeat(150), // Exceeds 100 char limit
        description: "B".repeat(600), // Exceeds 500 char limit
        systemPrompt: "Valid prompt",
      };

      const fieldErrors = [
        { path: "name", message: "Name cannot exceed 100 characters" },
        {
          path: "description",
          message: "Description cannot exceed 500 characters",
        },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.name).toHaveLength(100);
      expect(result!.description).toHaveLength(500);
      expect(result!.name).toBe("A".repeat(100));
      expect(result!.description).toBe("B".repeat(500));
    });

    it("should only truncate string fields", () => {
      const roleData = {
        id: "test-role",
        name: 12345, // Non-string value
        description: "Valid description",
        systemPrompt: "Valid prompt",
      };

      const fieldErrors = [
        { path: "name", message: "Name cannot exceed 100 characters" },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).toBeNull(); // No recovery possible for non-string
    });
  });

  describe("missing required fields", () => {
    it("should provide default ID for missing required ID", () => {
      const roleData = {
        name: "Test Role",
        description: "Valid description",
        systemPrompt: "Valid prompt",
      };

      const fieldErrors = [{ path: "id", message: "ID is required" }];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.id).toMatch(/^recovered-\d+$/);
    });

    it("should provide default name for missing required name", () => {
      const roleData = {
        id: "test-role",
        description: "Valid description",
        systemPrompt: "Valid prompt",
      };

      const fieldErrors = [{ path: "name", message: "Name is required" }];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Recovered Role");
    });

    it("should handle empty string validation errors", () => {
      const roleData = {
        id: "",
        name: "",
        description: "Valid description",
        systemPrompt: "Valid prompt",
      };

      const fieldErrors = [
        { path: "id", message: "ID cannot be empty" },
        { path: "name", message: "Name cannot be empty" },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.id).toMatch(/^recovered-\d+$/);
      expect(result!.name).toBe("Recovered Role");
    });

    it("should not override existing valid values", () => {
      const roleData = {
        id: "existing-id",
        name: "Existing Name",
        description: "Valid description",
        systemPrompt: "Valid prompt",
      };

      const fieldErrors = [
        { path: "other", message: "Other field is required" },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).toBeNull(); // No recovery for unknown fields
    });
  });

  describe("invalid timestamps", () => {
    it("should set invalid timestamps to null", () => {
      const roleData = {
        id: "test-role",
        name: "Test Role",
        description: "Valid description",
        systemPrompt: "Valid prompt",
        createdAt: "invalid-date",
        updatedAt: "also-invalid",
      };

      const fieldErrors = [
        { path: "createdAt", message: "Must be a valid ISO datetime" },
        { path: "updatedAt", message: "Must be a valid ISO datetime" },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.createdAt).toBeNull();
      expect(result!.updatedAt).toBeNull();
    });

    it("should handle single timestamp recovery", () => {
      const roleData = {
        id: "test-role",
        name: "Test Role",
        description: "Valid description",
        systemPrompt: "Valid prompt",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "not-a-date",
      };

      const fieldErrors = [
        { path: "updatedAt", message: "Must be a valid ISO datetime" },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.createdAt).toBe("2025-01-15T10:30:00.000Z");
      expect(result!.updatedAt).toBeNull();
    });
  });

  describe("complex recovery scenarios", () => {
    it("should handle multiple types of errors simultaneously", () => {
      const roleData = {
        id: "",
        name: "A".repeat(150),
        description: "Valid description",
        systemPrompt: "Valid prompt",
        createdAt: "invalid-date",
      };

      const fieldErrors = [
        { path: "id", message: "ID cannot be empty" },
        { path: "name", message: "Name cannot exceed 100 characters" },
        { path: "createdAt", message: "Must be a valid ISO datetime" },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.id).toMatch(/^recovered-\d+$/);
      expect(result!.name).toHaveLength(100);
      expect(result!.createdAt).toBeNull();
    });

    it("should preserve fields that don't need recovery", () => {
      const roleData = {
        id: "test-role",
        name: "A".repeat(150),
        description: "This should remain unchanged",
        systemPrompt: "This should also remain unchanged",
      };

      const fieldErrors = [
        { path: "name", message: "Name cannot exceed 100 characters" },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.name).toHaveLength(100);
      expect(result!.description).toBe("This should remain unchanged");
      expect(result!.systemPrompt).toBe("This should also remain unchanged");
    });
  });

  describe("edge cases", () => {
    it("should handle errors with invalid path formats", () => {
      const roleData = {
        id: "test-role",
        name: "Test Role",
      };

      const fieldErrors = [
        { path: "", message: "Empty path" },
        { path: ".", message: "Just a dot" },
        { path: "deeply.nested.path.that.ends.nowhere", message: "Deep path" },
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).toBeNull(); // No recoverable errors
    });

    it("should handle character limits with edge case numbers", () => {
      const roleData = {
        id: "test-role",
        name: "Test",
        description: "Short",
      };

      const fieldErrors = [
        { path: "name", message: "Name cannot exceed abc characters" }, // Invalid number
        {
          path: "description",
          message: "Description cannot exceed 0 characters",
        }, // Zero limit
      ];

      const result = recoverRoleFields(roleData, fieldErrors);

      expect(result).not.toBeNull();
      expect(result!.description).toBe(""); // Truncated to 0 characters
      expect(result!.name).toBe("Test"); // Unchanged due to invalid limit
    });
  });
});
