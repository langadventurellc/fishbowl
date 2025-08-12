import { safeJsonParse } from "../../../../validation/safeJsonParse";

describe("safeJsonParse", () => {
  it("should parse valid JSON", () => {
    expect(safeJsonParse('{"key": "value"}')).toEqual({ key: "value" });
    expect(safeJsonParse("[1, 2, 3]")).toEqual([1, 2, 3]);
    expect(safeJsonParse('"string"')).toBe("string");
    expect(safeJsonParse("123")).toBe(123);
    expect(safeJsonParse("true")).toBe(true);
    expect(safeJsonParse("false")).toBe(false);
    expect(safeJsonParse("null")).toBe(null);
  });

  it("should return undefined for invalid JSON", () => {
    expect(safeJsonParse("invalid")).toBeUndefined();
    expect(safeJsonParse("{key: value}")).toBeUndefined();
    expect(safeJsonParse("")).toBeUndefined();
    expect(safeJsonParse("{")).toBeUndefined();
    expect(safeJsonParse("}")).toBeUndefined();
    expect(safeJsonParse('["incomplete"')).toBeUndefined();
  });

  it("should return fallback for invalid JSON", () => {
    const fallback = { default: true };
    expect(safeJsonParse("invalid", fallback)).toBe(fallback);
    expect(safeJsonParse("", fallback)).toBe(fallback);
    expect(safeJsonParse("{", fallback)).toBe(fallback);
  });

  it("should handle type safety with generics", () => {
    interface TestType {
      name: string;
      value: number;
    }

    const result = safeJsonParse<TestType>('{"name": "test", "value": 42}');
    expect(result).toEqual({ name: "test", value: 42 });

    const invalidResult = safeJsonParse<TestType>("invalid");
    expect(invalidResult).toBeUndefined();
  });

  it("should handle nested objects", () => {
    const nested = {
      level1: {
        level2: {
          value: "deep",
        },
      },
    };
    const jsonString = JSON.stringify(nested);
    expect(safeJsonParse(jsonString)).toEqual(nested);
  });

  it("should handle arrays with mixed types", () => {
    const array = [1, "string", true, null, { key: "value" }];
    const jsonString = JSON.stringify(array);
    expect(safeJsonParse(jsonString)).toEqual(array);
  });

  it("should handle special characters and Unicode", () => {
    const special = {
      unicode: "🎉✨",
      quotes: '"quoted"',
      newlines: "line1\nline2",
      tabs: "tab\ttab",
    };
    const jsonString = JSON.stringify(special);
    expect(safeJsonParse(jsonString)).toEqual(special);
  });

  it("should handle very large JSON strings", () => {
    const largeObject: Record<string, number> = {};
    for (let i = 0; i < 10000; i++) {
      largeObject[`key${i}`] = i;
    }
    const jsonString = JSON.stringify(largeObject);
    const result = safeJsonParse(jsonString);
    expect(result).toEqual(largeObject);
  });

  it("should return fallback when provided and parsing fails", () => {
    const fallback: unknown[] = [];
    expect(safeJsonParse("invalid", fallback)).toBe(fallback);

    const objectFallback = { error: true };
    expect(safeJsonParse("{invalid}", objectFallback)).toBe(objectFallback);
  });

  it("should preserve null and boolean values correctly", () => {
    expect(safeJsonParse("null")).toBe(null);
    expect(safeJsonParse("true")).toBe(true);
    expect(safeJsonParse("false")).toBe(false);
  });
});
