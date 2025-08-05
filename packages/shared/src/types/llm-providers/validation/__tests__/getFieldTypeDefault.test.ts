import { getFieldTypeDefault } from "../getFieldTypeDefault";

describe("getFieldTypeDefault", () => {
  it("should return empty string for text field type", () => {
    expect(getFieldTypeDefault("text")).toBe("");
  });

  it("should return empty string for secure-text field type", () => {
    expect(getFieldTypeDefault("secure-text")).toBe("");
  });

  it("should return false for checkbox field type", () => {
    expect(getFieldTypeDefault("checkbox")).toBe(false);
  });

  it("should return empty string for unknown field types", () => {
    expect(getFieldTypeDefault("unknown")).toBe("");
    expect(getFieldTypeDefault("radio")).toBe("");
    expect(getFieldTypeDefault("select")).toBe("");
    expect(getFieldTypeDefault("")).toBe("");
  });

  it("should handle case sensitivity correctly", () => {
    expect(getFieldTypeDefault("TEXT")).toBe("");
    expect(getFieldTypeDefault("Checkbox")).toBe("");
    expect(getFieldTypeDefault("SECURE-TEXT")).toBe("");
  });

  it("should handle special characters and whitespace", () => {
    expect(getFieldTypeDefault(" text ")).toBe("");
    expect(getFieldTypeDefault("text-field")).toBe("");
    expect(getFieldTypeDefault("secure_text")).toBe("");
  });

  describe("return type validation", () => {
    it("should always return string or boolean", () => {
      const result1 = getFieldTypeDefault("text");
      expect(typeof result1).toBe("string");

      const result2 = getFieldTypeDefault("checkbox");
      expect(typeof result2).toBe("boolean");

      const result3 = getFieldTypeDefault("unknown");
      expect(typeof result3).toBe("string");
    });
  });
});
