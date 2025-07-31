import { z } from "zod";
import { validateWithSchema } from "../validateWithSchema.js";
import { SettingsValidationError } from "../../errors/SettingsValidationError.js";

describe("validateWithSchema", () => {
  describe("successful validation", () => {
    it("should return validated data for valid input", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const validData = { name: "John", age: 30 };
      const result = validateWithSchema(validData, schema);

      expect(result).toEqual(validData);
    });

    it("should handle complex nested schemas", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            settings: z.object({
              theme: z.enum(["light", "dark"]),
              notifications: z.boolean(),
            }),
          }),
        }),
        metadata: z.array(z.string()),
      });

      const validData = {
        user: {
          profile: {
            name: "Alice",
            settings: {
              theme: "dark" as const,
              notifications: true,
            },
          },
        },
        metadata: ["tag1", "tag2"],
      };

      const result = validateWithSchema(validData, schema);
      expect(result).toEqual(validData);
    });

    it("should apply schema transformations", () => {
      const schema = z.object({
        value: z.string().transform((val) => val.toUpperCase()),
        count: z.string().transform((val) => parseInt(val, 10)),
      });

      const input = { value: "hello", count: "42" };
      const result = validateWithSchema(input, schema);

      expect(result).toEqual({
        value: "HELLO",
        count: 42,
      });
    });
  });

  describe("validation failures", () => {
    it("should throw SettingsValidationError for invalid data", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const invalidData = { name: 123, age: "not a number" };

      expect(() => validateWithSchema(invalidData, schema)).toThrow(
        SettingsValidationError,
      );
    });

    it("should include field errors in the thrown exception", () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });

      const invalidData = { name: 123, email: "invalid-email" };

      try {
        validateWithSchema(invalidData, schema);
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toHaveLength(2);
          expect(error.fieldErrors).toContainEqual({
            path: "name",
            message: "Invalid input: expected string, received number",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "email",
            message: "Invalid email address",
          });
        }
      }
    });

    it("should handle nested validation errors", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(2),
            age: z.number().min(0),
          }),
        }),
      });

      const invalidData = {
        user: {
          profile: {
            name: "A",
            age: -5,
          },
        },
      };

      try {
        validateWithSchema(invalidData, schema);
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toHaveLength(2);
          expect(error.fieldErrors).toContainEqual({
            path: "user.profile.name",
            message: "Too small: expected string to have >=2 characters",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "user.profile.age",
            message: "Too small: expected number to be >=0",
          });
        }
      }
    });

    it("should handle array validation errors", () => {
      const schema = z.object({
        items: z.array(
          z.object({
            id: z.number(),
            name: z.string().min(1),
          }),
        ),
      });

      const invalidData = {
        items: [
          { id: 1, name: "valid" },
          { id: "invalid", name: "" },
          { id: 3, name: "also valid" },
        ],
      };

      try {
        validateWithSchema(invalidData, schema);
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toHaveLength(2);
          expect(error.fieldErrors).toContainEqual({
            path: "items.1.id",
            message: "Invalid input: expected number, received string",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "items.1.name",
            message: "Too small: expected string to have >=1 characters",
          });
        }
      }
    });
  });

  describe("context parameter", () => {
    it("should use context as filePath in error", () => {
      const schema = z.object({
        value: z.string(),
      });

      const invalidData = { value: 123 };
      const context = "/path/to/config.json";

      try {
        validateWithSchema(invalidData, schema, context);
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(context);
          expect(error.operation).toBe("validateWithSchema");
        }
      }
    });

    it("should handle undefined context", () => {
      const schema = z.object({
        value: z.string(),
      });

      const invalidData = { value: 123 };

      try {
        validateWithSchema(invalidData, schema);
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe("");
        }
      }
    });

    it("should handle empty string context", () => {
      const schema = z.object({
        value: z.string(),
      });

      const invalidData = { value: 123 };

      try {
        validateWithSchema(invalidData, schema, "");
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe("");
        }
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty objects", () => {
      const schema = z.object({});
      const result = validateWithSchema({}, schema);
      expect(result).toEqual({});
    });

    it("should handle optional fields", () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const validData = { required: "value" };
      const result = validateWithSchema(validData, schema);
      expect(result).toEqual({ required: "value" });
    });

    it("should handle default values", () => {
      const schema = z.object({
        value: z.string().default("default"),
        count: z.number().default(0),
      });

      const result = validateWithSchema({}, schema);
      expect(result).toEqual({
        value: "default",
        count: 0,
      });
    });

    it("should handle union types", () => {
      const schema = z.object({
        value: z.union([z.string(), z.number()]),
      });

      expect(validateWithSchema({ value: "string" }, schema)).toEqual({
        value: "string",
      });
      expect(validateWithSchema({ value: 123 }, schema)).toEqual({
        value: 123,
      });
    });

    it("should handle custom refinements", () => {
      const schema = z.object({
        password: z.string().refine((password) => password.length >= 8, {
          message: "Password must be at least 8 characters long",
        }),
      });

      expect(() => validateWithSchema({ password: "short" }, schema)).toThrow(
        SettingsValidationError,
      );
      expect(validateWithSchema({ password: "longenough" }, schema)).toEqual({
        password: "longenough",
      });
    });
  });
});
