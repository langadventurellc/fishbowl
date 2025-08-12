import { safeJsonStringify } from "../../../../validation/safeJsonStringify";

describe("safeJsonStringify", () => {
  it("should stringify valid objects", () => {
    expect(safeJsonStringify({ key: "value" })).toBe('{"key":"value"}');
    expect(safeJsonStringify([1, 2, 3])).toBe("[1,2,3]");
    expect(safeJsonStringify("string")).toBe('"string"');
    expect(safeJsonStringify(123)).toBe("123");
    expect(safeJsonStringify(true)).toBe("true");
    expect(safeJsonStringify(false)).toBe("false");
    expect(safeJsonStringify(null)).toBe("null");
  });

  it("should handle pretty printing", () => {
    const obj = { key: "value", nested: { prop: 123 } };
    const result = safeJsonStringify(obj, 2);
    expect(result).toBe(
      '{\n  "key": "value",\n  "nested": {\n    "prop": 123\n  }\n}',
    );
  });

  it("should handle circular references", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.circular = obj;

    const result = safeJsonStringify(obj);
    expect(result).toBe('{"a":1}');
  });

  it("should filter out functions", () => {
    const obj = {
      string: "value",
      number: 123,
      func: () => "test",
      nested: {
        func: () => "nested",
        value: "keep",
      },
    };

    expect(safeJsonStringify(obj)).toBe(
      '{"string":"value","number":123,"nested":{"value":"keep"}}',
    );
  });

  it("should filter out undefined values", () => {
    const obj = {
      defined: "value",
      undef: undefined,
      nested: {
        defined: "keep",
        undef: undefined,
      },
    };

    expect(safeJsonStringify(obj)).toBe(
      '{"defined":"value","nested":{"defined":"keep"}}',
    );
  });

  it("should handle arrays with filtered values", () => {
    const arr = [
      "string",
      123,
      () => "function",
      undefined,
      { value: "object", func: () => "test" },
    ];

    expect(safeJsonStringify(arr)).toBe(
      '["string",123,null,null,{"value":"object"}]',
    );
  });

  it("should handle nested circular references", () => {
    const parent: Record<string, unknown> = { name: "parent" };
    const child: Record<string, unknown> = { name: "child", parent };
    parent.child = child;

    const result = safeJsonStringify(parent);
    expect(result).toBe('{"name":"parent","child":{"name":"child"}}');
  });

  it("should handle multiple circular references", () => {
    const obj1: Record<string, unknown> = { name: "obj1" };
    const obj2: Record<string, unknown> = { name: "obj2" };
    obj1.ref = obj2;
    obj2.ref = obj1;

    const result = safeJsonStringify(obj1);
    expect(result).toBe('{"name":"obj1","ref":{"name":"obj2"}}');
  });

  it("should return undefined when JSON.stringify would throw", () => {
    // Create object that throws during serialization
    const obj = {
      get value() {
        throw new Error("Cannot serialize");
      },
    };

    const result = safeJsonStringify(obj);
    expect(result).toBeUndefined();
  });

  it("should handle Date objects", () => {
    const date = new Date("2023-01-01T00:00:00.000Z");
    const obj = { timestamp: date };

    const result = safeJsonStringify(obj);
    expect(result).toBe('{"timestamp":"2023-01-01T00:00:00.000Z"}');
  });

  it("should handle RegExp objects", () => {
    const obj = { pattern: /test/gi };

    const result = safeJsonStringify(obj);
    expect(result).toBe('{"pattern":{}}');
  });

  it("should handle very large objects", () => {
    const largeObject: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) {
      largeObject[`key${i}`] = i;
    }

    const result = safeJsonStringify(largeObject);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result?.length).toBeGreaterThan(0);
  });

  it("should handle symbols by filtering them out", () => {
    const sym = Symbol("test");
    const obj = {
      string: "value",
      [sym]: "symbol value",
      symbol: sym,
    };

    const result = safeJsonStringify(obj);
    expect(result).toBe('{"string":"value"}');
  });

  it("should preserve null values", () => {
    const obj = {
      nullValue: null,
      nested: {
        alsoNull: null,
      },
    };

    expect(safeJsonStringify(obj)).toBe(
      '{"nullValue":null,"nested":{"alsoNull":null}}',
    );
  });

  it("should handle empty objects and arrays", () => {
    expect(safeJsonStringify({})).toBe("{}");
    expect(safeJsonStringify([])).toBe("[]");
    expect(safeJsonStringify({ empty: {} })).toBe('{"empty":{}}');
    expect(safeJsonStringify({ empty: [] })).toBe('{"empty":[]}');
  });
});
