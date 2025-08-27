import {
  PersonalityDefinitions,
  PersonalitySectionDef,
  PersonalityTraitDef,
  PersonalityValueMeta,
  PersonalityValues,
  PersonalityError,
  PersonalityParseError,
  PersonalityFileAccessError,
  PersonalityValidationError,
} from "../index";
import { DiscreteValue, DISCRETE_VALUES } from "../../../utils/discreteValues";

describe("Personality Types", () => {
  describe("Type Exports", () => {
    it("should export all core personality types", () => {
      // Test that all types are properly exported by creating sample objects
      const valueMeta: PersonalityValueMeta = {
        short: "Test description",
        prompt: "Test prompt",
      };

      const traitDef: PersonalityTraitDef = {
        id: "testTrait",
        name: "Test Trait",
        values: {
          "0": valueMeta,
          "20": valueMeta,
          "40": valueMeta,
          "60": valueMeta,
          "80": valueMeta,
          "100": valueMeta,
        },
      };

      const sectionDef: PersonalitySectionDef = {
        id: "testSection",
        name: "Test Section",
        values: [traitDef],
      };

      const definitions: PersonalityDefinitions = {
        sections: [sectionDef],
      };

      const values: PersonalityValues = {
        testTrait: 60,
      };

      expect(valueMeta).toBeDefined();
      expect(traitDef).toBeDefined();
      expect(sectionDef).toBeDefined();
      expect(definitions).toBeDefined();
      expect(values).toBeDefined();
    });
  });

  describe("Discrete Value Constraints", () => {
    it("should only accept valid discrete values in PersonalityTraitDef", () => {
      const valueMeta: PersonalityValueMeta = {
        short: "Test",
      };

      // Test that all discrete values are accepted
      const validTraitDef: PersonalityTraitDef = {
        id: "test",
        name: "Test",
        values: {
          "0": valueMeta,
          "20": valueMeta,
          "40": valueMeta,
          "60": valueMeta,
          "80": valueMeta,
          "100": valueMeta,
        },
      };

      expect(validTraitDef.values["0"]).toBe(valueMeta);
      expect(validTraitDef.values["100"]).toBe(valueMeta);
    });

    it("should accept only DiscreteValue types in PersonalityValues", () => {
      // TypeScript compiler ensures this at compile time
      // Runtime test to verify discrete values work correctly
      DISCRETE_VALUES.forEach((value: DiscreteValue) => {
        const values: PersonalityValues = {
          testTrait: value,
        };
        expect(values.testTrait).toBe(value);
      });
    });
  });

  describe("PersonalityValueMeta", () => {
    it("should support all optional fields", () => {
      // Test with all fields
      const fullMeta: PersonalityValueMeta = {
        short: "Short description",
        prompt: "Full prompt text",
        value: 0.5,
      };

      expect(fullMeta.short).toBe("Short description");
      expect(fullMeta.prompt).toBe("Full prompt text");
      expect(fullMeta.value).toBe(0.5);

      // Test with only required field
      const minimalMeta: PersonalityValueMeta = {
        short: "Minimal",
      };

      expect(minimalMeta.short).toBe("Minimal");
      expect(minimalMeta.prompt).toBeUndefined();
      expect(minimalMeta.value).toBeUndefined();
    });
  });

  describe("PersonalitySectionDef", () => {
    it("should support optional description field", () => {
      const traitDef: PersonalityTraitDef = {
        id: "test",
        name: "Test",
        values: {
          "0": { short: "Low" },
          "20": { short: "Moderate" },
          "40": { short: "Average" },
          "60": { short: "High" },
          "80": { short: "Very High" },
          "100": { short: "Maximum" },
        },
      };

      // With description
      const sectionWithDesc: PersonalitySectionDef = {
        id: "test",
        name: "Test Section",
        description: "A test section",
        values: [traitDef],
      };

      expect(sectionWithDesc.description).toBe("A test section");

      // Without description
      const sectionWithoutDesc: PersonalitySectionDef = {
        id: "test",
        name: "Test Section",
        values: [traitDef],
      };

      expect(sectionWithoutDesc.description).toBeUndefined();
    });
  });
});

describe("Personality Error Types", () => {
  describe("PersonalityError", () => {
    class TestPersonalityError extends PersonalityError {
      constructor(message: string, operation: string, cause?: Error) {
        super(message, operation, cause);
      }
    }

    it("should create error with proper fields", () => {
      const error = new TestPersonalityError("Test message", "testOp");

      expect(error.message).toBe("Test message");
      expect(error.operation).toBe("testOp");
      expect(error.name).toBe("TestPersonalityError");
      expect(error.cause).toBeUndefined();
    });

    it("should include cause when provided", () => {
      const cause = new Error("Original error");
      const error = new TestPersonalityError("Test message", "testOp", cause);

      expect(error.cause).toBe(cause);
    });

    it("should serialize to JSON correctly", () => {
      const cause = new Error("Original error");
      const error = new TestPersonalityError("Test message", "testOp", cause);

      const json = error.toJSON();

      expect(json).toEqual({
        name: "TestPersonalityError",
        message: "Test message",
        operation: "testOp",
        cause: "Original error",
      });
    });
  });

  describe("PersonalityParseError", () => {
    it("should create parse error with proper message", () => {
      const error = new PersonalityParseError("Invalid JSON syntax");

      expect(error.message).toBe(
        "Failed to parse personality definitions JSON: Invalid JSON syntax",
      );
      expect(error.operation).toBe("parse");
      expect(error.parseError).toBe("Invalid JSON syntax");
    });

    it("should include parseError in JSON serialization", () => {
      const error = new PersonalityParseError("Invalid JSON");

      const json = error.toJSON();

      expect(json).toEqual(
        expect.objectContaining({
          name: "PersonalityParseError",
          operation: "parse",
          parseError: "Invalid JSON",
        }),
      );
    });
  });

  describe("PersonalityFileAccessError", () => {
    it("should create file access error with proper message", () => {
      const error = new PersonalityFileAccessError("File not found");

      expect(error.message).toBe(
        "Failed to access personality definitions file: File not found",
      );
      expect(error.operation).toBe("fileAccess");
      expect(error.reason).toBe("File not found");
    });

    it("should include reason in JSON serialization", () => {
      const error = new PersonalityFileAccessError("Permission denied");

      const json = error.toJSON();

      expect(json).toEqual(
        expect.objectContaining({
          name: "PersonalityFileAccessError",
          operation: "fileAccess",
          reason: "Permission denied",
        }),
      );
    });
  });

  describe("PersonalityValidationError", () => {
    it("should create validation error with proper message", () => {
      const error = new PersonalityValidationError(
        "Missing required field: sections",
      );

      expect(error.message).toBe(
        "Personality definitions failed validation: Missing required field: sections",
      );
      expect(error.operation).toBe("validation");
      expect(error.validationDetails).toBe("Missing required field: sections");
    });

    it("should include validation details in JSON serialization", () => {
      const error = new PersonalityValidationError("Invalid schema");

      const json = error.toJSON();

      expect(json).toEqual(
        expect.objectContaining({
          name: "PersonalityValidationError",
          operation: "validation",
          validationDetails: "Invalid schema",
        }),
      );
    });
  });
});
