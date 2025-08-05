import { z } from "zod";
import { extendFieldSchema } from "../extendFieldSchema";

describe("extendFieldSchema", () => {
  it("should extend field schema with custom metadata", () => {
    const ExtendedFieldSchema = extendFieldSchema({
      customMetadata: z.string().optional(),
      validationRules: z.array(z.string()).optional(),
    });

    const validExtendedField = {
      id: "test-field",
      type: "text",
      label: "Test Field",
      required: false,
      customMetadata: "custom value",
      validationRules: ["rule1", "rule2"],
    };

    const result = ExtendedFieldSchema.safeParse(validExtendedField);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customMetadata).toBe("custom value");
      expect(result.data.validationRules).toEqual(["rule1", "rule2"]);
    }
  });

  it("should maintain original field schema validation", () => {
    const ExtendedFieldSchema = extendFieldSchema({
      extra: z.string().optional(),
    });

    // Should still validate the original field requirements
    const invalidField = {
      id: "", // Invalid: empty ID
      type: "text",
      label: "Test",
      required: false,
      extra: "some value",
    };

    const result = ExtendedFieldSchema.safeParse(invalidField);
    expect(result.success).toBe(false);
  });

  it("should work with multiple extension types", () => {
    const ExtendedFieldSchema = extendFieldSchema({
      priority: z.number().min(1).max(10),
      category: z.enum(["primary", "secondary"]),
      isExperimental: z.boolean(),
      tags: z.array(z.string()),
    });

    const validField = {
      id: "extended-field",
      type: "checkbox",
      label: "Extended Field",
      required: true,
      priority: 5,
      category: "primary" as const,
      isExperimental: false,
      tags: ["tag1", "tag2"],
    };

    const result = ExtendedFieldSchema.safeParse(validField);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe(5);
      expect(result.data.category).toBe("primary");
      expect(result.data.isExperimental).toBe(false);
      expect(result.data.tags).toEqual(["tag1", "tag2"]);
    }
  });

  it("should validate extended field properties", () => {
    const ExtendedFieldSchema = extendFieldSchema({
      priority: z.number().min(1).max(10),
      email: z.string().email(),
    });

    const invalidExtensions = {
      id: "test-field",
      type: "text",
      label: "Test Field",
      required: false,
      priority: 15, // Invalid: exceeds max
      email: "not-an-email", // Invalid: not email format
    };

    const result = ExtendedFieldSchema.safeParse(invalidExtensions);
    expect(result.success).toBe(false);
  });

  it("should handle optional extensions correctly", () => {
    const ExtendedFieldSchema = extendFieldSchema({
      optionalField: z.string().optional(),
      requiredField: z.number(),
    });

    // With optional field omitted
    const fieldWithoutOptional = {
      id: "test-field",
      type: "secure-text",
      label: "Test Field",
      required: true,
      requiredField: 42,
    };

    const result1 = ExtendedFieldSchema.safeParse(fieldWithoutOptional);
    expect(result1.success).toBe(true);

    // With optional field included
    const fieldWithOptional = {
      ...fieldWithoutOptional,
      optionalField: "optional value",
    };

    const result2 = ExtendedFieldSchema.safeParse(fieldWithOptional);
    expect(result2.success).toBe(true);

    // Missing required extension field
    const fieldMissingRequired = {
      id: "test-field",
      type: "text",
      label: "Test Field",
      required: false,
      // Missing requiredField
    };

    const result3 = ExtendedFieldSchema.safeParse(fieldMissingRequired);
    expect(result3.success).toBe(false);
  });

  it("should work with empty extensions object", () => {
    const ExtendedFieldSchema = extendFieldSchema({});

    const basicField = {
      id: "basic-field",
      type: "text",
      label: "Basic Field",
      required: false,
    };

    const result = ExtendedFieldSchema.safeParse(basicField);
    expect(result.success).toBe(true);
  });

  it("should support nested object extensions", () => {
    const ExtendedFieldSchema = extendFieldSchema({
      validation: z
        .object({
          minLength: z.number().optional(),
          maxLength: z.number().optional(),
          pattern: z.string().optional(),
        })
        .optional(),
    });

    const fieldWithNested = {
      id: "validated-field",
      type: "text",
      label: "Validated Field",
      required: false,
      validation: {
        minLength: 5,
        maxLength: 100,
        pattern: "^[a-zA-Z0-9]+$",
      },
    };

    const result = ExtendedFieldSchema.safeParse(fieldWithNested);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.validation?.minLength).toBe(5);
      expect(result.data.validation?.pattern).toBe("^[a-zA-Z0-9]+$");
    }
  });
});
