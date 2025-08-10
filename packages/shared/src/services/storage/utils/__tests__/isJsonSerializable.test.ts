import { isJsonSerializable } from "../../../../validation/isJsonSerializable";

describe("isJsonSerializable", () => {
  it("should return true for serializable primitives", () => {
    expect(isJsonSerializable("string")).toBe(true);
    expect(isJsonSerializable(123)).toBe(true);
    expect(isJsonSerializable(0)).toBe(true);
    expect(isJsonSerializable(-123)).toBe(true);
    expect(isJsonSerializable(3.14)).toBe(true);
    expect(isJsonSerializable(true)).toBe(true);
    expect(isJsonSerializable(false)).toBe(true);
    expect(isJsonSerializable(null)).toBe(true);
    expect(isJsonSerializable(undefined)).toBe(true);
  });

  it("should return true for serializable objects", () => {
    expect(isJsonSerializable({ key: "value" })).toBe(true);
    expect(isJsonSerializable([1, 2, 3])).toBe(true);
    expect(isJsonSerializable({ nested: { prop: 123 } })).toBe(true);
    expect(isJsonSerializable({})).toBe(true);
    expect(isJsonSerializable([])).toBe(true);
  });

  it("should return false for non-serializable values", () => {
    expect(isJsonSerializable(() => "function")).toBe(false);
    expect(isJsonSerializable(Symbol("symbol"))).toBe(false);
    expect(isJsonSerializable(Symbol.iterator)).toBe(false);
  });

  it("should return false for objects containing non-serializable values", () => {
    expect(isJsonSerializable({ func: () => "test" })).toBe(false);
    expect(isJsonSerializable({ sym: Symbol("test") })).toBe(false);
    expect(isJsonSerializable([1, 2, () => "test"])).toBe(false);
    expect(isJsonSerializable([Symbol("test")])).toBe(false);
  });

  it("should return false for circular references", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.circular = obj;

    expect(isJsonSerializable(obj)).toBe(false);
  });

  it("should return false for nested circular references", () => {
    const parent: Record<string, unknown> = { name: "parent" };
    const child: Record<string, unknown> = { name: "child", parent };
    parent.child = child;

    expect(isJsonSerializable(parent)).toBe(false);
  });

  it("should handle deeply nested structures", () => {
    const valid = {
      level1: {
        level2: {
          level3: {
            value: "deep",
            array: [1, 2, 3],
            nested: {
              prop: true,
            },
          },
        },
      },
    };

    const invalid = {
      level1: {
        level2: {
          level3: {
            func: () => "invalid",
          },
        },
      },
    };

    expect(isJsonSerializable(valid)).toBe(true);
    expect(isJsonSerializable(invalid)).toBe(false);
  });

  it("should handle arrays with mixed content", () => {
    const validArray = [
      "string",
      123,
      true,
      null,
      undefined,
      { key: "value" },
      [1, 2, 3],
    ];

    const invalidArray = ["string", 123, () => "function"];

    expect(isJsonSerializable(validArray)).toBe(true);
    expect(isJsonSerializable(invalidArray)).toBe(false);
  });

  it("should handle special objects that are serializable", () => {
    const date = new Date();
    const regex = /test/g;

    // Date objects are serializable (they have toJSON method)
    expect(isJsonSerializable(date)).toBe(true);

    // RegExp objects are serializable (they become empty objects)
    expect(isJsonSerializable(regex)).toBe(true);
  });

  it("should handle very large objects", () => {
    const largeObject: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) {
      largeObject[`key${i}`] = i;
    }

    expect(isJsonSerializable(largeObject)).toBe(true);
  });

  it("should handle objects with null and undefined values", () => {
    const obj = {
      nullValue: null,
      undefinedValue: undefined,
      nested: {
        alsoNull: null,
        alsoUndefined: undefined,
      },
    };

    expect(isJsonSerializable(obj)).toBe(true);
  });

  it("should handle complex nested structures", () => {
    const complex = {
      string: "value",
      number: 123,
      boolean: true,
      nullValue: null,
      undefinedValue: undefined,
      object: {
        nested: "value",
        array: [1, 2, 3],
        deepNested: {
          prop: "deep",
        },
      },
      array: ["string", 123, true, null, undefined, { key: "value" }],
    };

    expect(isJsonSerializable(complex)).toBe(true);
  });

  it("should detect functions at any depth", () => {
    const obj = {
      level1: {
        level2: {
          level3: {
            level4: {
              func: () => "deep function",
            },
          },
        },
      },
    };

    expect(isJsonSerializable(obj)).toBe(false);
  });

  it("should detect symbols at any depth", () => {
    const obj = {
      level1: {
        level2: {
          level3: {
            level4: {
              sym: Symbol("deep symbol"),
            },
          },
        },
      },
    };

    expect(isJsonSerializable(obj)).toBe(false);
  });

  it("should handle arrays with circular references", () => {
    const arr: unknown[] = [1, 2, 3];
    arr.push(arr);

    expect(isJsonSerializable(arr)).toBe(false);
  });

  it("should return false when checking throws an error", () => {
    // Create object that throws during property access
    const obj = {
      get problematic() {
        throw new Error("Cannot access");
      },
    };

    expect(isJsonSerializable(obj)).toBe(false);
  });

  it("should handle empty structures", () => {
    expect(isJsonSerializable({})).toBe(true);
    expect(isJsonSerializable([])).toBe(true);
    expect(isJsonSerializable({ empty: {} })).toBe(true);
    expect(isJsonSerializable({ empty: [] })).toBe(true);
  });
});
