import { z } from "zod";
import { appearanceSettingsSchema } from "../appearanceSettingsSchema";

describe("appearanceSettingsSchema", () => {
  describe("valid theme combinations", () => {
    it("should accept 'light' theme", () => {
      const result = appearanceSettingsSchema.parse({ theme: "light" });
      expect(result.theme).toBe("light");
    });

    it("should accept 'dark' theme", () => {
      const result = appearanceSettingsSchema.parse({ theme: "dark" });
      expect(result.theme).toBe("dark");
    });

    it("should accept 'system' theme", () => {
      const result = appearanceSettingsSchema.parse({ theme: "system" });
      expect(result.theme).toBe("system");
    });

    it("should default to 'system' theme when undefined", () => {
      const result = appearanceSettingsSchema.parse({});
      expect(result.theme).toBe("system");
    });
  });

  describe("valid timestamp display options", () => {
    it("should accept 'always' for showTimestamps", () => {
      const result = appearanceSettingsSchema.parse({
        showTimestamps: "always",
      });
      expect(result.showTimestamps).toBe("always");
    });

    it("should accept 'hover' for showTimestamps", () => {
      const result = appearanceSettingsSchema.parse({
        showTimestamps: "hover",
      });
      expect(result.showTimestamps).toBe("hover");
    });

    it("should accept 'never' for showTimestamps", () => {
      const result = appearanceSettingsSchema.parse({
        showTimestamps: "never",
      });
      expect(result.showTimestamps).toBe("never");
    });

    it("should default to 'hover' for showTimestamps when undefined", () => {
      const result = appearanceSettingsSchema.parse({});
      expect(result.showTimestamps).toBe("hover");
    });
  });

  describe("valid message spacing options", () => {
    it("should accept 'compact' for messageSpacing", () => {
      const result = appearanceSettingsSchema.parse({
        messageSpacing: "compact",
      });
      expect(result.messageSpacing).toBe("compact");
    });

    it("should accept 'normal' for messageSpacing", () => {
      const result = appearanceSettingsSchema.parse({
        messageSpacing: "normal",
      });
      expect(result.messageSpacing).toBe("normal");
    });

    it("should accept 'relaxed' for messageSpacing", () => {
      const result = appearanceSettingsSchema.parse({
        messageSpacing: "relaxed",
      });
      expect(result.messageSpacing).toBe("relaxed");
    });

    it("should default to 'normal' for messageSpacing when undefined", () => {
      const result = appearanceSettingsSchema.parse({});
      expect(result.messageSpacing).toBe("normal");
    });
  });

  describe("font size boundary validation", () => {
    it("should accept valid font size at minimum boundary (12)", () => {
      const result = appearanceSettingsSchema.parse({ fontSize: 12 });
      expect(result.fontSize).toBe(12);
    });

    it("should accept valid font size at default (14)", () => {
      const result = appearanceSettingsSchema.parse({ fontSize: 14 });
      expect(result.fontSize).toBe(14);
    });

    it("should accept valid font size at maximum boundary (18)", () => {
      const result = appearanceSettingsSchema.parse({ fontSize: 18 });
      expect(result.fontSize).toBe(18);
    });

    it("should default to 14 for fontSize when undefined", () => {
      const result = appearanceSettingsSchema.parse({});
      expect(result.fontSize).toBe(14);
    });

    it("should reject font size below minimum (11)", () => {
      expect(() => {
        appearanceSettingsSchema.parse({ fontSize: 11 });
      }).toThrow("Font size must be at least 12px");
    });

    it("should reject font size above maximum (19)", () => {
      expect(() => {
        appearanceSettingsSchema.parse({ fontSize: 19 });
      }).toThrow("Font size cannot exceed 18px");
    });

    it("should reject non-integer font sizes", () => {
      expect(() => {
        appearanceSettingsSchema.parse({ fontSize: 14.5 });
      }).toThrow("Font size must be a whole number");
    });

    it("should reject non-numeric font sizes", () => {
      expect(() => {
        appearanceSettingsSchema.parse({ fontSize: "14" });
      }).toThrow("Font size must be a number");
    });
  });

  describe("boolean validation", () => {
    it("should accept true for showActivityTime", () => {
      const result = appearanceSettingsSchema.parse({ showActivityTime: true });
      expect(result.showActivityTime).toBe(true);
    });

    it("should accept false for showActivityTime", () => {
      const result = appearanceSettingsSchema.parse({
        showActivityTime: false,
      });
      expect(result.showActivityTime).toBe(false);
    });

    it("should default to true for showActivityTime when undefined", () => {
      const result = appearanceSettingsSchema.parse({});
      expect(result.showActivityTime).toBe(true);
    });

    it("should accept true for compactList", () => {
      const result = appearanceSettingsSchema.parse({ compactList: true });
      expect(result.compactList).toBe(true);
    });

    it("should accept false for compactList", () => {
      const result = appearanceSettingsSchema.parse({ compactList: false });
      expect(result.compactList).toBe(false);
    });

    it("should default to false for compactList when undefined", () => {
      const result = appearanceSettingsSchema.parse({});
      expect(result.compactList).toBe(false);
    });

    it("should reject non-boolean values for showActivityTime", () => {
      expect(() => {
        appearanceSettingsSchema.parse({ showActivityTime: "true" });
      }).toThrow("Show activity time must be true or false");
    });

    it("should reject non-boolean values for compactList", () => {
      expect(() => {
        appearanceSettingsSchema.parse({ compactList: "false" });
      }).toThrow("Compact list must be true or false");
    });
  });

  describe("default value application", () => {
    it("should apply all default values for empty object", () => {
      const result = appearanceSettingsSchema.parse({});
      expect(result).toEqual({
        theme: "system",
        showTimestamps: "hover",
        showActivityTime: true,
        compactList: false,
        fontSize: 14,
        messageSpacing: "normal",
      });
    });

    it("should apply defaults for missing fields in partial object", () => {
      const result = appearanceSettingsSchema.parse({
        theme: "dark",
        fontSize: 16,
      });
      expect(result).toEqual({
        theme: "dark",
        showTimestamps: "hover",
        showActivityTime: true,
        compactList: false,
        fontSize: 16,
        messageSpacing: "normal",
      });
    });

    it("should reject undefined input", () => {
      expect(() => {
        appearanceSettingsSchema.parse(undefined);
      }).toThrow("Invalid input: expected object, received undefined");
    });
  });

  describe("enum validation error messages", () => {
    it("should provide clear error message for invalid theme", () => {
      expect(() => {
        appearanceSettingsSchema.parse({ theme: "invalid" });
      }).toThrow("Theme must be 'light', 'dark', or 'system'");
    });

    it("should provide clear error message for invalid showTimestamps", () => {
      expect(() => {
        appearanceSettingsSchema.parse({ showTimestamps: "invalid" });
      }).toThrow("Show timestamps must be 'always', 'hover', or 'never'");
    });

    it("should provide clear error message for invalid messageSpacing", () => {
      expect(() => {
        appearanceSettingsSchema.parse({ messageSpacing: "invalid" });
      }).toThrow("Message spacing must be 'compact', 'normal', or 'relaxed'");
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        appearanceSettingsSchema.parse(null);
      }).toThrow("Invalid input: expected object, received null");
    });

    it("should reject array input", () => {
      expect(() => {
        appearanceSettingsSchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        appearanceSettingsSchema.parse("invalid");
      }).toThrow();
    });

    it("should reject number input", () => {
      expect(() => {
        appearanceSettingsSchema.parse(42);
      }).toThrow();
    });
  });

  describe("complete valid settings object", () => {
    it("should validate a complete valid appearance settings object", () => {
      const validSettings = {
        theme: "dark" as const,
        showTimestamps: "always" as const,
        showActivityTime: false,
        compactList: true,
        fontSize: 16,
        messageSpacing: "relaxed" as const,
      };

      const result = appearanceSettingsSchema.parse(validSettings);
      expect(result).toEqual(validSettings);
    });
  });

  describe("type inference", () => {
    it("should infer correct types from schema", () => {
      type InferredType = z.infer<typeof appearanceSettingsSchema>;

      // This test verifies TypeScript type inference works correctly
      const testObject: InferredType = {
        theme: "light",
        showTimestamps: "hover",
        showActivityTime: true,
        compactList: false,
        fontSize: 14,
        messageSpacing: "normal",
      };

      const result = appearanceSettingsSchema.parse(testObject);
      expect(result).toEqual(testObject);
    });
  });
});
