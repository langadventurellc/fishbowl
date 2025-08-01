import { z, ZodError } from "zod";
import { transformValidationError } from "../transformValidationError";

describe("transformValidationError", () => {
  it("should handle single field errors", () => {
    const schema = z.object({
      theme: z.enum(["light", "dark"]),
    });

    try {
      schema.parse({ theme: "invalid" });
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      expect(result).toContain("Theme:");
      expect(result).toContain("light");
      expect(result).toContain("dark");
    }
  });

  it("should handle multiple field errors", () => {
    const schema = z.object({
      fontSize: z.number().min(10).max(32),
      theme: z.enum(["light", "dark"]),
    });

    try {
      schema.parse({ fontSize: 5, theme: "invalid" });
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      expect(result).toContain("Invalid settings:");
      expect(result).toContain("• Font Size:");
      expect(result).toContain("• Theme:");
    }
  });

  it("should handle errors with category context", () => {
    const schema = z.object({
      theme: z.enum(["light", "dark"]),
    });

    try {
      schema.parse({ theme: "invalid" });
    } catch (error) {
      const result = transformValidationError(error as ZodError, "appearance");
      expect(result).toContain("Theme:");
    }
  });

  it("should handle errors with category context for multiple errors", () => {
    const schema = z.object({
      fontSize: z.number(),
      theme: z.enum(["light", "dark"]),
    });

    try {
      schema.parse({ fontSize: "invalid", theme: "invalid" });
    } catch (error) {
      const result = transformValidationError(error as ZodError, "appearance");
      expect(result).toContain("Invalid appearance settings:");
    }
  });

  it("should handle nested field errors", () => {
    const schema = z.object({
      display: z.object({
        fontSize: z.number(),
      }),
    });

    try {
      schema.parse({ display: { fontSize: "invalid" } });
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      expect(result).toContain("Display font size:");
    }
  });

  it("should handle array field errors", () => {
    const schema = z.object({
      extensions: z.array(z.string()).min(1),
    });

    try {
      schema.parse({ extensions: [] });
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      expect(result).toContain("Extensions:");
    }
  });

  it("should handle string validation errors", () => {
    const schema = z.object({
      email: z.string().email(),
    });

    try {
      schema.parse({ email: "invalid-email" });
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      expect(result).toContain("Invalid email address");
    }
  });

  it("should deduplicate messages for the same field", () => {
    // Create a schema that could produce duplicate errors
    const schema = z.object({
      password: z.string().min(8),
    });

    try {
      schema.parse({ password: "short" });
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      // Should contain the field name but not duplicate the same error
      expect(result).toContain("Password:");
      const passwordCount = (result.match(/Password:/g) || []).length;
      expect(passwordCount).toBe(1);
    }
  });

  it("should fallback to generic message for empty issues", () => {
    // Create a mock ZodError with no issues
    const error = new ZodError([]);

    const result = transformValidationError(error);
    expect(result).toBe("Invalid settings. Please check your input.");
  });

  it("should fallback to generic message with category for empty issues", () => {
    const error = new ZodError([]);

    const result = transformValidationError(error, "general");
    expect(result).toBe("Invalid general settings. Please check your input.");
  });

  it("should handle root-level validation errors", () => {
    const schema = z.string();

    try {
      schema.parse(123);
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      expect(result).toContain("settings:");
    }
  });

  it("should handle complex nested paths", () => {
    const schema = z.object({
      userPreferences: z.object({
        theme: z.object({
          mode: z.enum(["light", "dark"]),
        }),
      }),
    });

    try {
      schema.parse({
        userPreferences: {
          theme: {
            mode: "invalid",
          },
        },
      });
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      expect(result).toContain("User Preferences theme mode:");
    }
  });

  it("should handle array index paths", () => {
    const schema = z.object({
      items: z.array(
        z.object({
          name: z.string(),
        }),
      ),
    });

    try {
      schema.parse({
        items: [{ name: "valid" }, { name: 123 }],
      });
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      expect(result).toContain("Items [1] name:");
    }
  });

  it("should preserve existing field context in messages", () => {
    // Test with a schema that produces a message with field context
    const schema = z.object({
      theme: z
        .string()
        .refine(
          (val) => val === "light" || val === "dark",
          "Theme must be either light or dark mode",
        ),
    });

    try {
      schema.parse({ theme: "invalid" });
    } catch (error) {
      const result = transformValidationError(error as ZodError);
      // Should use the original message since it already has context
      expect(result).toContain("Theme must be either light or dark mode");
    }
  });
});
