import { createRolesValidationSummary } from "../createRolesValidationSummary";

describe("createRolesValidationSummary", () => {
  describe("basic functionality", () => {
    it("should return empty string for no errors", () => {
      const summary = createRolesValidationSummary([]);
      expect(summary).toBe("");
    });

    it("should return the message for single error", () => {
      const errors = [
        { path: "roles.0.name", message: "Role name is required" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("Role name is required");
    });

    it("should handle single error with undefined message gracefully", () => {
      const errors = [{ path: "roles.0.name", message: "" }];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("Role validation error occurred");
    });
  });

  describe("multiple errors", () => {
    it("should create summary for single role with multiple errors", () => {
      const errors = [
        { path: "roles.0.name", message: "Name is required" },
        { path: "roles.0.description", message: "Description too long" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("Role 1 has 2 validation issues.");
    });

    it("should create summary for single role with one error", () => {
      const errors = [{ path: "roles.0.name", message: "Name is required" }];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("Name is required");
    });

    it("should create summary for multiple roles with errors", () => {
      const errors = [
        { path: "roles.0.name", message: "Error 1" },
        { path: "roles.0.description", message: "Error 2" },
        { path: "roles.1.id", message: "Error 3" },
        { path: "roles.2.systemPrompt", message: "Error 4" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("3 roles have validation errors.");
    });

    it("should handle top-level configuration errors", () => {
      const errors = [
        { path: "schemaVersion", message: "Schema version invalid" },
        { path: "lastUpdated", message: "Date format invalid" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("2 configuration errors.");
    });

    it("should handle mixed top-level and role errors", () => {
      const errors = [
        { path: "schemaVersion", message: "Schema version invalid" },
        { path: "roles.0.name", message: "Name required" },
        { path: "roles.1.description", message: "Description too long" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe(
        "1 configuration error. 2 roles have validation errors.",
      );
    });

    it("should handle single configuration error with single role error", () => {
      const errors = [
        { path: "schemaVersion", message: "Schema version invalid" },
        { path: "roles.0.name", message: "Name required" },
        { path: "roles.0.description", message: "Description invalid" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe(
        "1 configuration error. Role 1 has 2 validation issues.",
      );
    });
  });

  describe("role indexing", () => {
    it("should correctly handle role indices", () => {
      const errors = [
        { path: "roles.5.name", message: "Error in role 6" },
        { path: "roles.5.description", message: "Another error in role 6" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("Role 6 has 2 validation issues.");
    });

    it("should handle zero-indexed roles correctly", () => {
      const errors = [{ path: "roles.0.name", message: "First role error" }];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("First role error");
    });

    it("should handle non-numeric role indices gracefully", () => {
      const errors = [
        { path: "roles.invalid.name", message: "Invalid path error" },
      ];

      const summary = createRolesValidationSummary(errors);
      // Single error returns the error message directly
      expect(summary).toBe("Invalid path error");
    });
  });

  describe("edge cases", () => {
    it("should handle undefined path parts gracefully", () => {
      const errors = [
        { path: "roles", message: "Roles array error" },
        { path: "roles.0", message: "Role object error" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("2 configuration errors.");
    });

    it("should handle empty path gracefully", () => {
      const errors = [{ path: "", message: "Root error" }];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("Root error");
    });

    it("should handle role paths with insufficient depth", () => {
      const errors = [
        { path: "roles.0", message: "Incomplete role path" },
        { path: "roles.1", message: "Another incomplete path" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("2 configuration errors.");
    });
  });

  describe("pluralization", () => {
    it("should use singular form for single configuration error", () => {
      const errors = [{ path: "schemaVersion", message: "Schema error" }];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("Schema error");
    });

    it("should use plural form for multiple configuration errors", () => {
      const errors = [
        { path: "schemaVersion", message: "Schema error" },
        { path: "lastUpdated", message: "Date error" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("2 configuration errors.");
    });

    it("should use singular form for single role validation issue", () => {
      const errors = [{ path: "roles.0.name", message: "Name error" }];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("Name error");
    });

    it("should use plural form for multiple role validation issues", () => {
      const errors = [
        { path: "roles.0.name", message: "Name error" },
        { path: "roles.0.description", message: "Description error" },
      ];

      const summary = createRolesValidationSummary(errors);
      expect(summary).toBe("Role 1 has 2 validation issues.");
    });
  });
});
