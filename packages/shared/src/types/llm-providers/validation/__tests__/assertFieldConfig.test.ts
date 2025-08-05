import { assertFieldConfig } from "../assertFieldConfig";
import { z } from "zod";

describe("assertFieldConfig", () => {
  it("should pass for valid text field configuration", () => {
    const validTextField = {
      id: "baseUrl",
      type: "text",
      label: "Base URL",
      required: false,
      placeholder: "https://api.example.com",
      helperText: "Enter the API base URL",
      defaultValue: "https://api.example.com",
    };

    expect(() => assertFieldConfig(validTextField)).not.toThrow();
  });

  it("should pass for valid secure-text field configuration", () => {
    const validSecureField = {
      id: "apiKey",
      type: "secure-text",
      label: "API Key",
      required: true,
      placeholder: "Enter your API key",
      helperText: "Get this from your provider dashboard",
    };

    expect(() => assertFieldConfig(validSecureField)).not.toThrow();
  });

  it("should pass for valid checkbox field configuration", () => {
    const validCheckboxField = {
      id: "enableAuth",
      type: "checkbox",
      label: "Enable Authentication",
      required: false,
      helperText: "Check to enable custom authentication",
      defaultValue: true,
    };

    expect(() => assertFieldConfig(validCheckboxField)).not.toThrow();
  });

  it("should throw ZodError for invalid field type", () => {
    const invalidTypeField = {
      id: "testField",
      type: "invalid-type",
      label: "Test Field",
      required: false,
    };

    expect(() => assertFieldConfig(invalidTypeField)).toThrow(z.ZodError);
  });

  it("should throw ZodError for missing required properties", () => {
    const incompleteField = {
      id: "testField",
      // Missing 'type' and 'label'
      required: false,
    };

    expect(() => assertFieldConfig(incompleteField)).toThrow(z.ZodError);
  });

  it("should throw ZodError for empty field ID", () => {
    const emptyIdField = {
      id: "", // Invalid: empty string
      type: "text",
      label: "Test Field",
      required: false,
    };

    expect(() => assertFieldConfig(emptyIdField)).toThrow(z.ZodError);
  });

  it("should throw ZodError for empty field label", () => {
    const emptyLabelField = {
      id: "testField",
      type: "text",
      label: "", // Invalid: empty string
      required: false,
    };

    expect(() => assertFieldConfig(emptyLabelField)).toThrow(z.ZodError);
  });

  it("should throw ZodError for non-string field ID", () => {
    const invalidIdField = {
      id: 123, // Invalid: not a string
      type: "text",
      label: "Test Field",
      required: false,
    };

    expect(() => assertFieldConfig(invalidIdField)).toThrow(z.ZodError);
  });

  it("should pass for minimal valid field configuration", () => {
    const minimalField = {
      id: "minimal-field",
      type: "text",
      label: "Minimal Field",
      required: false,
    };

    expect(() => assertFieldConfig(minimalField)).not.toThrow();
  });
});
