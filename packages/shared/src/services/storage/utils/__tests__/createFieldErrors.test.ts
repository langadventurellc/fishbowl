import { z } from "zod";
import { createFieldErrors } from "../createFieldErrors.js";

describe("createFieldErrors", () => {
  describe("basic field error creation", () => {
    it("should transform single field errors", () => {
      const schema = z.object({
        name: z.string(),
      });

      const result = schema.safeParse({ name: 123 });
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(1);
        expect(fieldErrors[0]).toEqual({
          path: "name",
          message: "Invalid input: expected string, received number",
        });
      }
    });

    it("should transform multiple field errors", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      });

      const result = schema.safeParse({
        name: 123,
        age: "not a number",
        email: "invalid-email",
      });
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(3);

        const nameError = fieldErrors.find((e) => e.path === "name");
        const ageError = fieldErrors.find((e) => e.path === "age");
        const emailError = fieldErrors.find((e) => e.path === "email");

        expect(nameError).toEqual({
          path: "name",
          message: "Invalid input: expected string, received number",
        });
        expect(ageError).toEqual({
          path: "age",
          message: "Invalid input: expected number, received string",
        });
        expect(emailError).toEqual({
          path: "email",
          message: "Invalid email address",
        });
      }
    });
  });

  describe("nested field errors", () => {
    it("should handle nested object field errors", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            age: z.number(),
          }),
        }),
      });

      const result = schema.safeParse({
        user: {
          profile: {
            name: 123,
            age: "invalid",
          },
        },
      });
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(2);

        expect(fieldErrors).toContainEqual({
          path: "user.profile.name",
          message: "Invalid input: expected string, received number",
        });
        expect(fieldErrors).toContainEqual({
          path: "user.profile.age",
          message: "Invalid input: expected number, received string",
        });
      }
    });

    it("should handle array field errors", () => {
      const schema = z.object({
        items: z.array(z.string()),
      });

      const result = schema.safeParse({
        items: ["valid", 123, "also valid", true],
      });
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(2);

        expect(fieldErrors).toContainEqual({
          path: "items.1",
          message: "Invalid input: expected string, received number",
        });
        expect(fieldErrors).toContainEqual({
          path: "items.3",
          message: "Invalid input: expected string, received boolean",
        });
      }
    });

    it("should handle complex nested structures", () => {
      const schema = z.object({
        settings: z.object({
          appearance: z.object({
            theme: z.enum(["light", "dark"]),
            fontSize: z.number().min(10),
          }),
          features: z.array(
            z.object({
              name: z.string(),
              enabled: z.boolean(),
            }),
          ),
        }),
      });

      const result = schema.safeParse({
        settings: {
          appearance: {
            theme: "invalid",
            fontSize: 5,
          },
          features: [
            { name: "feature1", enabled: true },
            { name: 123, enabled: "not boolean" },
          ],
        },
      });
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(4);

        expect(fieldErrors).toContainEqual({
          path: "settings.appearance.theme",
          message: 'Invalid option: expected one of "light"|"dark"',
        });
        expect(fieldErrors).toContainEqual({
          path: "settings.appearance.fontSize",
          message: "Too small: expected number to be >=10",
        });
        expect(fieldErrors).toContainEqual({
          path: "settings.features.1.name",
          message: "Invalid input: expected string, received number",
        });
        expect(fieldErrors).toContainEqual({
          path: "settings.features.1.enabled",
          message: "Invalid input: expected boolean, received string",
        });
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty path errors", () => {
      const schema = z.string();
      const result = schema.safeParse(123);
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(1);
        expect(fieldErrors[0]).toEqual({
          path: "root",
          message: "Invalid input: expected string, received number",
        });
      }
    });

    it("should handle union type errors", () => {
      const schema = z.object({
        value: z.union([z.string(), z.number()]),
      });

      const result = schema.safeParse({ value: true });
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(1);
        expect(fieldErrors[0]!.path).toBe("value");
        expect(fieldErrors[0]!.message).toContain("Invalid input");
      }
    });

    it("should handle custom validation errors", () => {
      const schema = z.object({
        password: z.string().refine((password) => password.length >= 8, {
          message: "Password must be at least 8 characters long",
        }),
      });

      const result = schema.safeParse({ password: "short" });
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(1);
        expect(fieldErrors[0]).toEqual({
          path: "password",
          message: "Password must be at least 8 characters long",
        });
      }
    });
  });

  describe("path formatting", () => {
    it("should format array paths correctly", () => {
      const schema = z.array(
        z.object({
          nested: z.array(z.string()),
        }),
      );

      const result = schema.safeParse([{ nested: ["valid", 123] }]);
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(1);
        expect(fieldErrors[0]!.path).toBe("0.nested.1");
      }
    });

    it("should format deeply nested paths correctly", () => {
      const schema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.array(
              z.object({
                value: z.string(),
              }),
            ),
          }),
        }),
      });

      const result = schema.safeParse({
        level1: {
          level2: {
            level3: [{ value: 123 }],
          },
        },
      });
      expect(result.success).toBe(false);

      if (!result.success) {
        const fieldErrors = createFieldErrors(result.error);
        expect(fieldErrors).toHaveLength(1);
        expect(fieldErrors[0]!.path).toBe("level1.level2.level3.0.value");
      }
    });
  });
});
