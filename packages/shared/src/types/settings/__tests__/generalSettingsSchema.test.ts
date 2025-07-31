import { z } from "zod";
import { generalSettingsSchema } from "../generalSettingsSchema";

describe("generalSettingsSchema", () => {
  describe("response delay validation", () => {
    it("should accept valid response delay at minimum boundary (1000)", () => {
      const result = generalSettingsSchema.parse({ responseDelay: 1000 });
      expect(result.responseDelay).toBe(1000);
    });

    it("should accept valid response delay at default (2000)", () => {
      const result = generalSettingsSchema.parse({ responseDelay: 2000 });
      expect(result.responseDelay).toBe(2000);
    });

    it("should accept valid response delay at maximum boundary (30000)", () => {
      const result = generalSettingsSchema.parse({
        responseDelay: 30000,
        maximumWaitTime: 120000, // Ensure wait time is greater than response delay
      });
      expect(result.responseDelay).toBe(30000);
    });

    it("should default to 2000 for responseDelay when undefined", () => {
      const result = generalSettingsSchema.parse({});
      expect(result.responseDelay).toBe(2000);
    });

    it("should reject response delay below minimum (999)", () => {
      expect(() => {
        generalSettingsSchema.parse({ responseDelay: 999 });
      }).toThrow("Response delay must be at least 1000ms");
    });

    it("should reject response delay above maximum (30001)", () => {
      expect(() => {
        generalSettingsSchema.parse({ responseDelay: 30001 });
      }).toThrow("Response delay cannot exceed 30000ms");
    });

    it("should reject non-integer response delays", () => {
      expect(() => {
        generalSettingsSchema.parse({ responseDelay: 2000.5 });
      }).toThrow("Response delay must be a whole number");
    });

    it("should reject non-numeric response delays", () => {
      expect(() => {
        generalSettingsSchema.parse({ responseDelay: "2000" });
      }).toThrow("Response delay must be a number");
    });
  });

  describe("maximum messages validation", () => {
    it("should accept valid maximum messages at minimum boundary (0)", () => {
      const result = generalSettingsSchema.parse({ maximumMessages: 0 });
      expect(result.maximumMessages).toBe(0);
    });

    it("should accept valid maximum messages at default (50)", () => {
      const result = generalSettingsSchema.parse({ maximumMessages: 50 });
      expect(result.maximumMessages).toBe(50);
    });

    it("should accept valid maximum messages at maximum boundary (500)", () => {
      const result = generalSettingsSchema.parse({ maximumMessages: 500 });
      expect(result.maximumMessages).toBe(500);
    });

    it("should default to 50 for maximumMessages when undefined", () => {
      const result = generalSettingsSchema.parse({});
      expect(result.maximumMessages).toBe(50);
    });

    it("should reject maximum messages below minimum (-1)", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumMessages: -1 });
      }).toThrow("Maximum messages cannot be negative");
    });

    it("should reject maximum messages above maximum (501)", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumMessages: 501 });
      }).toThrow("Maximum messages cannot exceed 500");
    });

    it("should reject non-integer maximum messages", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumMessages: 50.5 });
      }).toThrow("Maximum messages must be a whole number");
    });

    it("should reject non-numeric maximum messages", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumMessages: "50" });
      }).toThrow("Maximum messages must be a number");
    });
  });

  describe("maximum wait time validation", () => {
    it("should accept valid maximum wait time at minimum boundary (5000)", () => {
      const result = generalSettingsSchema.parse({ maximumWaitTime: 5000 });
      expect(result.maximumWaitTime).toBe(5000);
    });

    it("should accept valid maximum wait time at default (30000)", () => {
      const result = generalSettingsSchema.parse({ maximumWaitTime: 30000 });
      expect(result.maximumWaitTime).toBe(30000);
    });

    it("should accept valid maximum wait time at maximum boundary (120000)", () => {
      const result = generalSettingsSchema.parse({ maximumWaitTime: 120000 });
      expect(result.maximumWaitTime).toBe(120000);
    });

    it("should default to 30000 for maximumWaitTime when undefined", () => {
      const result = generalSettingsSchema.parse({});
      expect(result.maximumWaitTime).toBe(30000);
    });

    it("should reject maximum wait time below minimum (4999)", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumWaitTime: 4999 });
      }).toThrow("Maximum wait time must be at least 5000ms");
    });

    it("should reject maximum wait time above maximum (120001)", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumWaitTime: 120001 });
      }).toThrow("Maximum wait time cannot exceed 120000ms");
    });

    it("should reject non-integer maximum wait times", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumWaitTime: 30000.5 });
      }).toThrow("Maximum wait time must be a whole number");
    });

    it("should reject non-numeric maximum wait times", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumWaitTime: "30000" });
      }).toThrow("Maximum wait time must be a number");
    });
  });

  describe("default mode validation", () => {
    it("should accept 'manual' for defaultMode", () => {
      const result = generalSettingsSchema.parse({ defaultMode: "manual" });
      expect(result.defaultMode).toBe("manual");
    });

    it("should accept 'auto' for defaultMode", () => {
      const result = generalSettingsSchema.parse({ defaultMode: "auto" });
      expect(result.defaultMode).toBe("auto");
    });

    it("should default to 'manual' for defaultMode when undefined", () => {
      const result = generalSettingsSchema.parse({});
      expect(result.defaultMode).toBe("manual");
    });

    it("should reject invalid default mode values", () => {
      expect(() => {
        generalSettingsSchema.parse({ defaultMode: "invalid" });
      }).toThrow("Default mode must be either 'manual' or 'auto'");
    });

    it("should reject non-string default mode values", () => {
      expect(() => {
        generalSettingsSchema.parse({ defaultMode: 123 });
      }).toThrow("Default mode must be either 'manual' or 'auto'");
    });
  });

  describe("maximum agents validation", () => {
    it("should accept valid maximum agents at minimum boundary (1)", () => {
      const result = generalSettingsSchema.parse({ maximumAgents: 1 });
      expect(result.maximumAgents).toBe(1);
    });

    it("should accept valid maximum agents at default (4)", () => {
      const result = generalSettingsSchema.parse({ maximumAgents: 4 });
      expect(result.maximumAgents).toBe(4);
    });

    it("should accept valid maximum agents at maximum boundary (8)", () => {
      const result = generalSettingsSchema.parse({ maximumAgents: 8 });
      expect(result.maximumAgents).toBe(8);
    });

    it("should default to 4 for maximumAgents when undefined", () => {
      const result = generalSettingsSchema.parse({});
      expect(result.maximumAgents).toBe(4);
    });

    it("should reject maximum agents below minimum (0)", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumAgents: 0 });
      }).toThrow("At least 1 agent is required");
    });

    it("should reject maximum agents above maximum (9)", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumAgents: 9 });
      }).toThrow("Cannot exceed 8 agents");
    });

    it("should reject non-integer maximum agents", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumAgents: 4.5 });
      }).toThrow("Maximum agents must be a whole number");
    });

    it("should reject non-numeric maximum agents", () => {
      expect(() => {
        generalSettingsSchema.parse({ maximumAgents: "4" });
      }).toThrow("Maximum agents must be a number");
    });
  });

  describe("check updates validation", () => {
    it("should accept true for checkUpdates", () => {
      const result = generalSettingsSchema.parse({ checkUpdates: true });
      expect(result.checkUpdates).toBe(true);
    });

    it("should accept false for checkUpdates", () => {
      const result = generalSettingsSchema.parse({ checkUpdates: false });
      expect(result.checkUpdates).toBe(false);
    });

    it("should default to true for checkUpdates when undefined", () => {
      const result = generalSettingsSchema.parse({});
      expect(result.checkUpdates).toBe(true);
    });

    it("should reject non-boolean values for checkUpdates", () => {
      expect(() => {
        generalSettingsSchema.parse({ checkUpdates: "true" });
      }).toThrow("Update check must be true or false");
    });

    it("should reject numeric values for checkUpdates", () => {
      expect(() => {
        generalSettingsSchema.parse({ checkUpdates: 1 });
      }).toThrow("Update check must be true or false");
    });
  });

  describe("default value application", () => {
    it("should apply all default values for empty object", () => {
      const result = generalSettingsSchema.parse({});
      expect(result).toEqual({
        responseDelay: 2000,
        maximumMessages: 50,
        maximumWaitTime: 30000,
        defaultMode: "manual",
        maximumAgents: 4,
        checkUpdates: true,
      });
    });

    it("should apply defaults for missing fields in partial object", () => {
      const result = generalSettingsSchema.parse({
        responseDelay: 1500,
        defaultMode: "auto",
      });
      expect(result).toEqual({
        responseDelay: 1500,
        maximumMessages: 50,
        maximumWaitTime: 30000,
        defaultMode: "auto",
        maximumAgents: 4,
        checkUpdates: true,
      });
    });

    it("should reject undefined input", () => {
      expect(() => {
        generalSettingsSchema.parse(undefined);
      }).toThrow("Invalid input: expected object, received undefined");
    });
  });

  describe("cross-field validation", () => {
    it("should reject when response delay equals maximum wait time", () => {
      expect(() => {
        generalSettingsSchema.parse({
          responseDelay: 30000,
          maximumWaitTime: 30000,
        });
      }).toThrow("Response delay should be less than maximum wait time");
    });

    it("should reject when response delay exceeds maximum wait time", () => {
      expect(() => {
        generalSettingsSchema.parse({
          responseDelay: 35000,
          maximumWaitTime: 30000,
        });
      }).toThrow("Response delay should be less than maximum wait time");
    });

    it("should accept when response delay is less than maximum wait time", () => {
      const result = generalSettingsSchema.parse({
        responseDelay: 25000,
        maximumWaitTime: 30000,
      });
      expect(result.responseDelay).toBe(25000);
      expect(result.maximumWaitTime).toBe(30000);
    });

    it("should warn when unlimited messages (0) is combined with auto mode", () => {
      expect(() => {
        generalSettingsSchema.parse({
          maximumMessages: 0,
          defaultMode: "auto",
        });
      }).toThrow(
        "Consider setting a message limit when using auto mode to prevent runaway conversations",
      );
    });

    it("should accept unlimited messages with manual mode", () => {
      const result = generalSettingsSchema.parse({
        maximumMessages: 0,
        defaultMode: "manual",
      });
      expect(result.maximumMessages).toBe(0);
      expect(result.defaultMode).toBe("manual");
    });

    it("should accept limited messages with auto mode", () => {
      const result = generalSettingsSchema.parse({
        maximumMessages: 100,
        defaultMode: "auto",
      });
      expect(result.maximumMessages).toBe(100);
      expect(result.defaultMode).toBe("auto");
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        generalSettingsSchema.parse(null);
      }).toThrow("Invalid input: expected object, received null");
    });

    it("should reject array input", () => {
      expect(() => {
        generalSettingsSchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        generalSettingsSchema.parse("invalid");
      }).toThrow();
    });

    it("should reject number input", () => {
      expect(() => {
        generalSettingsSchema.parse(42);
      }).toThrow();
    });
  });

  describe("complete valid settings object", () => {
    it("should validate a complete valid general settings object", () => {
      const validSettings = {
        responseDelay: 1500,
        maximumMessages: 100,
        maximumWaitTime: 60000,
        defaultMode: "auto" as const,
        maximumAgents: 6,
        checkUpdates: false,
      };

      const result = generalSettingsSchema.parse(validSettings);
      expect(result).toEqual(validSettings);
    });
  });

  describe("type inference", () => {
    it("should infer correct types from schema", () => {
      type InferredType = z.infer<typeof generalSettingsSchema>;

      const testObject: InferredType = {
        responseDelay: 2000,
        maximumMessages: 50,
        maximumWaitTime: 30000,
        defaultMode: "manual",
        maximumAgents: 4,
        checkUpdates: true,
      };

      const result = generalSettingsSchema.parse(testObject);
      expect(result).toEqual(testObject);
    });
  });
});
