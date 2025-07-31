import { isValidJson } from "../isValidJson.js";

describe("isValidJson", () => {
  describe("valid JSON strings", () => {
    it("should return true for valid JSON primitives", () => {
      expect(isValidJson("null")).toBe(true);
      expect(isValidJson("true")).toBe(true);
      expect(isValidJson("false")).toBe(true);
      expect(isValidJson("123")).toBe(true);
      expect(isValidJson("0")).toBe(true);
      expect(isValidJson("-123")).toBe(true);
      expect(isValidJson("3.14")).toBe(true);
      expect(isValidJson('"string"')).toBe(true);
    });

    it("should return true for valid JSON objects", () => {
      expect(isValidJson('{"key": "value"}')).toBe(true);
      expect(isValidJson('{"nested": {"prop": 123}}')).toBe(true);
      expect(isValidJson("{}")).toBe(true);
      expect(isValidJson('{"array": [1, 2, 3]}')).toBe(true);
    });

    it("should return true for valid JSON arrays", () => {
      expect(isValidJson("[1, 2, 3]")).toBe(true);
      expect(isValidJson('["string", 123, true, null]')).toBe(true);
      expect(isValidJson("[]")).toBe(true);
      expect(isValidJson('[{"key": "value"}]')).toBe(true);
    });

    it("should return true for complex nested structures", () => {
      const complexJson = JSON.stringify({
        string: "value",
        number: 123,
        boolean: true,
        nullValue: null,
        object: {
          nested: "value",
          array: [1, 2, 3],
        },
        array: ["string", 123, true, null, { key: "value" }],
      });

      expect(isValidJson(complexJson)).toBe(true);
    });

    it("should return true for whitespace-padded JSON", () => {
      expect(isValidJson('  {"key": "value"}  ')).toBe(true);
      expect(isValidJson("\n[1, 2, 3]\n")).toBe(true);
      expect(isValidJson('\t"string"\t')).toBe(true);
    });
  });

  describe("invalid JSON strings", () => {
    it("should return false for malformed JSON", () => {
      expect(isValidJson("{key: value}")).toBe(false);
      expect(isValidJson('{"key": value}')).toBe(false);
      expect(isValidJson('{"key": "value",}')).toBe(false);
      expect(isValidJson("{")).toBe(false);
      expect(isValidJson("}")).toBe(false);
      expect(isValidJson("[")).toBe(false);
      expect(isValidJson("]")).toBe(false);
    });

    it("should return false for unquoted strings", () => {
      expect(isValidJson("hello")).toBe(false);
      expect(isValidJson("undefined")).toBe(false);
      expect(isValidJson("function")).toBe(false);
    });

    it("should return false for invalid escape sequences", () => {
      expect(isValidJson('"\\u"')).toBe(false);
      expect(isValidJson('"\\x41"')).toBe(false);
      expect(isValidJson('"\\z"')).toBe(false);
    });

    it("should return false for invalid numbers", () => {
      expect(isValidJson("123.")).toBe(false);
      expect(isValidJson(".123")).toBe(false);
      expect(isValidJson("01")).toBe(false);
      expect(isValidJson("NaN")).toBe(false);
      expect(isValidJson("Infinity")).toBe(false);
      expect(isValidJson("-Infinity")).toBe(false);
    });

    it("should return false for empty or whitespace-only strings", () => {
      expect(isValidJson("")).toBe(false);
      expect(isValidJson("   ")).toBe(false);
      expect(isValidJson("\n")).toBe(false);
      expect(isValidJson("\t")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle very large JSON strings", () => {
      const largeObject: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = i;
      }
      const largeJson = JSON.stringify(largeObject);

      expect(isValidJson(largeJson)).toBe(true);
    });

    it("should handle deeply nested structures", () => {
      let deepNested: Record<string, unknown> = { value: "deep" };
      for (let i = 0; i < 100; i++) {
        deepNested = { level: deepNested };
      }
      const deepJson = JSON.stringify(deepNested);

      expect(isValidJson(deepJson)).toBe(true);
    });

    it("should handle special character strings", () => {
      expect(isValidJson('"\\u0000"')).toBe(true);
      expect(isValidJson('"\\u0041"')).toBe(true);
      expect(isValidJson('"\\""')).toBe(true);
      expect(isValidJson('"\\\\"')).toBe(true);
      expect(isValidJson('"\\/"')).toBe(true);
      expect(isValidJson('"\\b\\f\\n\\r\\t"')).toBe(true);
    });
  });
});
