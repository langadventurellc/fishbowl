import { z } from "zod";
import { validateSettingsData } from "../validateSettingsData.js";
import { SettingsValidationError } from "../../errors/SettingsValidationError.js";

describe("validateSettingsData", () => {
  const testSchema = z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  });

  describe("successful validation", () => {
    it("should return validated data for valid input", () => {
      const validData = {
        name: "John Doe",
        age: 30,
        email: "john@example.com",
      };
      const filePath = "/path/to/settings.json";

      const result = validateSettingsData(
        validData,
        testSchema,
        filePath,
        "test",
      );
      expect(result).toEqual(validData);
    });

    it("should handle complex nested schemas", () => {
      const complexSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            preferences: z.object({
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
            preferences: {
              theme: "dark" as const,
              notifications: true,
            },
          },
        },
        metadata: ["tag1", "tag2"],
      };
      const filePath = "/config/complex.json";

      const result = validateSettingsData(
        validData,
        complexSchema,
        filePath,
        "test",
      );
      expect(result).toEqual(validData);
    });

    it("should apply schema transformations", () => {
      const transformSchema = z.object({
        value: z.string().transform((val) => val.toUpperCase()),
        count: z.string().transform((val) => parseInt(val, 10)),
      });

      const input = { value: "hello", count: "42" };
      const filePath = "/transform/settings.json";

      const result = validateSettingsData(
        input,
        transformSchema,
        filePath,
        "test",
      );
      expect(result).toEqual({
        value: "HELLO",
        count: 42,
      });
    });
  });

  describe("validation failures", () => {
    it("should throw SettingsValidationError with correct file path", () => {
      const invalidData = {
        name: 123,
        age: "not a number",
        email: "invalid-email",
      };
      const filePath = "/path/to/invalid.json";

      try {
        validateSettingsData(
          invalidData,
          testSchema,
          filePath,
          "validateSettingsData",
        );
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe("validateSettingsData");
          expect(error.fieldErrors).toHaveLength(3);
        }
      }
    });

    it("should include detailed field errors", () => {
      const invalidData = {
        name: "",
        age: -5,
        email: "not-an-email",
      };
      const schema = z.object({
        name: z.string().min(1, "Name is required"),
        age: z.number().min(0, "Age must be non-negative"),
        email: z.string().email("Invalid email format"),
      });
      const filePath = "/detailed/errors.json";

      try {
        validateSettingsData(
          invalidData,
          schema,
          filePath,
          "validateSettingsData",
        );
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual({
            path: "name",
            message: "Name is required",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "age",
            message: "Age must be non-negative",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "email",
            message: "Invalid email format",
          });
        }
      }
    });

    it("should handle nested validation errors with correct paths", () => {
      const nestedSchema = z.object({
        settings: z.object({
          appearance: z.object({
            theme: z.enum(["light", "dark"]),
            fontSize: z.number().min(10).max(20),
          }),
          features: z.array(
            z.object({
              name: z.string().min(1),
              enabled: z.boolean(),
            }),
          ),
        }),
      });

      const invalidData = {
        settings: {
          appearance: {
            theme: "invalid",
            fontSize: 5,
          },
          features: [
            { name: "valid", enabled: true },
            { name: "", enabled: "not-boolean" },
          ],
        },
      };
      const filePath = "/nested/settings.json";

      try {
        validateSettingsData(
          invalidData,
          nestedSchema,
          filePath,
          "validateSettingsData",
        );
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.fieldErrors).toHaveLength(4);

          expect(error.fieldErrors).toContainEqual({
            path: "settings.appearance.theme",
            message: 'Invalid option: expected one of "light"|"dark"',
          });
          expect(error.fieldErrors).toContainEqual({
            path: "settings.appearance.fontSize",
            message: "Too small: expected number to be >=10",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "settings.features.1.name",
            message: "Too small: expected string to have >=1 characters",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "settings.features.1.enabled",
            message: "Invalid input: expected boolean, received string",
          });
        }
      }
    });
  });

  describe("error context", () => {
    it("should include file path in error context", () => {
      const invalidData = { name: 123 };
      const schema = z.object({ name: z.string() });
      const filePath = "/context/test.json";

      try {
        validateSettingsData(
          invalidData,
          schema,
          filePath,
          "validateSettingsData",
        );
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe("validateSettingsData");
          expect(error.message).toContain("Settings validation failed");
        }
      }
    });

    it("should handle empty file path", () => {
      const invalidData = { name: 123 };
      const schema = z.object({ name: z.string() });
      const filePath = "";

      try {
        validateSettingsData(
          invalidData,
          schema,
          filePath,
          "validateSettingsData",
        );
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe("");
          expect(error.operation).toBe("validateSettingsData");
        }
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty objects", () => {
      const schema = z.object({});
      const result = validateSettingsData(
        {},
        schema,
        "/empty.json",
        "validateSettingsData",
      );
      expect(result).toEqual({});
    });

    it("should handle optional fields", () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const data = { required: "value" };
      const result = validateSettingsData(
        data,
        schema,
        "/optional.json",
        "test",
      );
      expect(result).toEqual({ required: "value" });
    });

    it("should handle default values", () => {
      const schema = z.object({
        value: z.string().default("default"),
        count: z.number().default(0),
      });

      const result = validateSettingsData(
        {},
        schema,
        "/defaults.json",
        "validateSettingsData",
      );
      expect(result).toEqual({
        value: "default",
        count: 0,
      });
    });

    it("should handle union types", () => {
      const schema = z.object({
        value: z.union([z.string(), z.number()]),
      });

      expect(
        validateSettingsData(
          { value: "string" },
          schema,
          "/union1.json",
          "test",
        ),
      ).toEqual({ value: "string" });
      expect(
        validateSettingsData(
          { value: 123 },
          schema,
          "/union2.json",
          "validateSettingsData",
        ),
      ).toEqual({ value: 123 });
    });

    it("should handle custom refinements", () => {
      const schema = z.object({
        password: z.string().refine((password) => password.length >= 8, {
          message: "Password must be at least 8 characters long",
        }),
      });

      expect(() =>
        validateSettingsData(
          { password: "short" },
          schema,
          "/refine.json",
          "test",
        ),
      ).toThrow(SettingsValidationError);

      expect(
        validateSettingsData(
          { password: "longenough" },
          schema,
          "/refine.json",
          "test",
        ),
      ).toEqual({ password: "longenough" });
    });

    it("should wrap and re-throw existing SettingsValidationError", () => {
      const schema = z.object({
        nested: z.object({
          value: z.string(),
        }),
      });

      const invalidData = { nested: { value: 123 } };
      const filePath = "/wrap/test.json";

      try {
        validateSettingsData(
          invalidData,
          schema,
          filePath,
          "validateSettingsData",
        );
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe("validateSettingsData");
          expect(error.fieldErrors).toHaveLength(1);
          expect(error.fieldErrors[0]!.path).toBe("nested.value");
        }
      }
    });
  });

  describe("integration with validateWithSchema", () => {
    it("should properly delegate to validateWithSchema", () => {
      const schema = z.object({
        config: z.object({
          debug: z.boolean(),
          level: z.number().min(1).max(5),
        }),
      });

      const validData = {
        config: {
          debug: true,
          level: 3,
        },
      };

      const result = validateSettingsData(
        validData,
        schema,
        "/integration.json",
        "test",
      );
      expect(result).toEqual(validData);
    });

    it("should preserve error details from validateWithSchema", () => {
      const schema = z.object({
        items: z.array(
          z.object({
            id: z.string().uuid(),
            value: z.number().positive(),
          }),
        ),
      });

      const invalidData = {
        items: [{ id: "not-uuid", value: -1 }],
      };

      try {
        validateSettingsData(
          invalidData,
          schema,
          "/preserve-errors.json",
          "test",
        );
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toHaveLength(2);
          expect(error.fieldErrors).toContainEqual({
            path: "items.0.id",
            message: "Invalid UUID",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "items.0.value",
            message: "Too small: expected number to be >0",
          });
        }
      }
    });
  });
});
