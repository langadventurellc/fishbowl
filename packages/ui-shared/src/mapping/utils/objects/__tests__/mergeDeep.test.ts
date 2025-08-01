import { mergeDeep } from "../mergeDeep";

describe("mergeDeep", () => {
  it("should merge simple objects", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = mergeDeep(target, source);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it("should merge nested objects deeply", () => {
    const target = { user: { name: "John", age: 30 } };
    const source = { user: { age: 31, city: "NYC" } };
    const result = mergeDeep(target, source);
    expect(result).toEqual({
      user: { name: "John", age: 31, city: "NYC" },
    });
  });

  it("should handle multiple sources", () => {
    const result = mergeDeep({ a: 1 }, { b: 2 }, { c: 3 }, { a: 4 });
    expect(result).toEqual({ a: 4, b: 2, c: 3 });
  });

  it("should not mutate original objects", () => {
    const target = { a: { b: 1 } };
    const source = { a: { c: 2 } };
    const result = mergeDeep(target, source);

    expect(target).toEqual({ a: { b: 1 } });
    expect(source).toEqual({ a: { c: 2 } });
    expect(result).toEqual({ a: { b: 1, c: 2 } });
    expect(result).not.toBe(target);
    expect(result.a).not.toBe(target.a);
  });

  it("should handle arrays by replacement not merging", () => {
    const target = { items: [1, 2] };
    const source = { items: [3, 4, 5] };
    const result = mergeDeep(target, source);
    expect(result).toEqual({ items: [3, 4, 5] });
  });

  it("should handle null and undefined", () => {
    const result = mergeDeep(
      { a: 1, b: { c: 2 } },
      { b: null },
      { a: undefined },
    );
    expect(result).toEqual({ a: undefined, b: null });
  });

  it("should handle dates correctly", () => {
    const date1 = new Date("2024-01-01");
    const date2 = new Date("2024-02-01");
    const target = { created: date1 };
    const source = { created: date2 };
    const result = mergeDeep(target, source);
    expect(result).toEqual({ created: date2 });
  });

  it("should prevent prototype pollution", () => {
    const malicious = {
      __proto__: { polluted: true },
      constructor: { polluted: true },
    };
    mergeDeep({}, malicious);
    expect(({} as unknown as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it("should handle empty sources", () => {
    const target = { a: 1 };
    expect(mergeDeep(target)).toEqual({ a: 1 });
    expect(
      mergeDeep(target, {}, null as unknown as Record<string, unknown>),
    ).toEqual({ a: 1 });
  });

  it("should return new object even with no sources", () => {
    const target = { a: 1 };
    const result = mergeDeep(target);
    expect(result).toEqual({ a: 1 });
    expect(result).not.toBe(target);
  });

  it("should handle complex nested merging", () => {
    const target = {
      user: {
        profile: {
          name: "John",
          settings: {
            theme: "dark",
            notifications: true,
          },
        },
        preferences: {
          language: "en",
        },
      },
    };

    const source = {
      user: {
        profile: {
          settings: {
            theme: "light",
            autoSave: true,
          },
        },
        preferences: {
          timezone: "UTC",
        },
      },
    };

    const result = mergeDeep(target, source);

    expect(result).toEqual({
      user: {
        profile: {
          name: "John",
          settings: {
            theme: "light",
            notifications: true,
            autoSave: true,
          },
        },
        preferences: {
          language: "en",
          timezone: "UTC",
        },
      },
    });
  });

  it("should handle constructor property safely", () => {
    const obj = { constructor: { polluted: true } };

    mergeDeep({}, obj);

    // Verify no pollution occurred
    expect(({} as unknown as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it("should handle __proto__ property safely", () => {
    const obj = { __proto__: { polluted: true } };

    mergeDeep({}, obj);

    // Verify no pollution occurred
    expect(({} as unknown as { polluted?: boolean }).polluted).toBeUndefined();
  });
});
