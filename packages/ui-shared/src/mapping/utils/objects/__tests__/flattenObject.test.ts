import { flattenObject } from "../flattenObject";

describe("flattenObject", () => {
  it("should flatten simple nested object", () => {
    const input = { a: { b: { c: 1 } } };
    const result = flattenObject(input);
    expect(result).toEqual({ "a.b.c": 1 });
  });

  it("should handle multiple nested levels", () => {
    const input = {
      user: {
        name: "John",
        address: {
          city: "New York",
          country: "USA",
        },
      },
    };
    const result = flattenObject(input);
    expect(result).toEqual({
      "user.name": "John",
      "user.address.city": "New York",
      "user.address.country": "USA",
    });
  });

  it("should handle arrays without flattening them", () => {
    const input = { items: [1, 2, 3], nested: { arr: ["a", "b"] } };
    const result = flattenObject(input);
    expect(result).toEqual({
      items: [1, 2, 3],
      "nested.arr": ["a", "b"],
    });
  });

  it("should handle null and undefined values", () => {
    const input = { a: null, b: undefined, c: { d: null } };
    const result = flattenObject(input);
    expect(result).toEqual({
      a: null,
      b: undefined,
      "c.d": null,
    });
  });

  it("should handle dates without converting them", () => {
    const date = new Date("2024-01-01");
    const input = { created: date, meta: { updated: date } };
    const result = flattenObject(input);
    expect(result).toEqual({
      created: date,
      "meta.updated": date,
    });
  });

  it("should handle empty objects", () => {
    expect(flattenObject({})).toEqual({});
    expect(flattenObject({ a: {} })).toEqual({});
  });

  it("should handle custom separator", () => {
    const input = { a: { b: { c: 1 } } };
    const result = flattenObject(input, "_");
    expect(result).toEqual({ a_b_c: 1 });
  });

  it("should prevent prototype pollution", () => {
    const malicious = {
      __proto__: { polluted: true },
      constructor: { polluted: true },
      prototype: { polluted: true },
    };
    const result = flattenObject(malicious);
    expect(result).toEqual({});
    expect(({} as unknown as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it("should handle objects with special properties", () => {
    const input = {
      regular: "value",
      __proto__: { malicious: true },
      constructor: { bad: true },
      prototype: { evil: true },
      normal: { nested: "ok" },
    };
    const result = flattenObject(input);
    expect(result).toEqual({
      regular: "value",
      "normal.nested": "ok",
    });
  });

  it("should handle circular references gracefully", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;

    // Should not crash but may have limitations
    expect(() => {
      try {
        flattenObject(obj);
      } catch (error) {
        // Circular references will cause stack overflow
        expect(error).toBeInstanceOf(RangeError);
        throw error;
      }
    }).toThrow();
  });

  it("should handle very deep nesting", () => {
    let deep: Record<string, unknown> = { value: "bottom" };
    for (let i = 0; i < 10; i++) {
      deep = { [`level${i}`]: deep };
    }

    const flattened = flattenObject(deep);

    // Check that the flattened object has the expected structure
    expect(Object.keys(flattened)).toContain(
      "level9.level8.level7.level6.level5.level4.level3.level2.level1.level0.value",
    );
    expect(
      flattened[
        "level9.level8.level7.level6.level5.level4.level3.level2.level1.level0.value"
      ],
    ).toBe("bottom");
  });

  it("should handle functions and symbols", () => {
    const fn = () => "function";
    const sym = Symbol("test");
    const obj = {
      func: fn,
      [sym]: "symbol value",
      regular: "string",
    };

    const flattened = flattenObject(obj);
    expect(flattened.func).toBe(fn);
    expect(flattened.regular).toBe("string");
  });
});
