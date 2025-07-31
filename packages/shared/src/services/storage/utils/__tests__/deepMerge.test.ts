import { deepMerge } from "../deepMerge.js";

describe("deepMerge", () => {
  it("should merge simple objects", () => {
    const target: Record<string, unknown> = { a: 1, b: 2 };
    const source: Record<string, unknown> = { b: 3, c: 4 };

    expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: 4 });
  });

  it("should not mutate source objects", () => {
    const target: Record<string, unknown> = { a: 1 };
    const source: Record<string, unknown> = { b: 2 };
    const result = deepMerge(target, source);

    expect(result).not.toBe(target);
    expect(target).toEqual({ a: 1 });
    expect(source).toEqual({ b: 2 });
  });

  it("should merge nested objects", () => {
    const target: Record<string, unknown> = {
      top: "value",
      nested: {
        a: 1,
        b: 2,
      },
    };

    const source: Record<string, unknown> = {
      nested: {
        b: 3,
        c: 4,
      },
    };

    expect(deepMerge(target, source)).toEqual({
      top: "value",
      nested: {
        a: 1,
        b: 3,
        c: 4,
      },
    });
  });

  it("should handle multiple sources", () => {
    const target: Record<string, unknown> = { a: 1 };
    const source1: Record<string, unknown> = { b: 2 };
    const source2: Record<string, unknown> = { c: 3 };
    const source3: Record<string, unknown> = { a: 4, d: 5 };

    expect(deepMerge(target, source1, source2, source3)).toEqual({
      a: 4,
      b: 2,
      c: 3,
      d: 5,
    });
  });

  it("should replace arrays instead of merging", () => {
    const target: Record<string, unknown> = { arr: [1, 2, 3] };
    const source: Record<string, unknown> = { arr: [4, 5] };

    expect(deepMerge(target, source)).toEqual({ arr: [4, 5] });
  });

  it("should handle null values", () => {
    const target: Record<string, unknown> = {
      a: { nested: "value" },
      b: "value",
    };
    const source: Record<string, unknown> = { a: null, b: null };

    expect(deepMerge(target, source)).toEqual({ a: null, b: null });
  });

  it("should skip undefined values", () => {
    const target: Record<string, unknown> = { a: 1, b: 2 };
    const source: Record<string, unknown> = { a: undefined, c: 3 };

    expect(deepMerge(target, source)).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("should handle empty sources", () => {
    const target: Record<string, unknown> = { a: 1 };

    expect(deepMerge(target)).toEqual({ a: 1 });
    expect(deepMerge(target, {})).toEqual({ a: 1 });
  });

  it("should skip non-object sources", () => {
    const target: Record<string, unknown> = { a: 1 };

    expect(
      deepMerge(target, null as unknown as Record<string, unknown>),
    ).toEqual({ a: 1 });
    expect(
      deepMerge(target, "string" as unknown as Record<string, unknown>),
    ).toEqual({ a: 1 });
    expect(
      deepMerge(target, 123 as unknown as Record<string, unknown>),
    ).toEqual({ a: 1 });
  });

  it("should preserve type safety with specific interfaces", () => {
    interface Config {
      name: string;
      settings: {
        enabled: boolean;
        value?: number;
      };
    }

    const target: Config = {
      name: "original",
      settings: {
        enabled: true,
      },
    };

    const source: Partial<Config> = {
      settings: {
        enabled: false,
        value: 42,
      },
    };

    // Type assertion for this specific test case
    const result = deepMerge(
      target as unknown as Record<string, unknown>,
      source as unknown as Record<string, unknown>,
    );

    expect(result).toEqual({
      name: "original",
      settings: {
        enabled: false,
        value: 42,
      },
    });
  });

  it("should handle deeply nested objects", () => {
    const target: Record<string, unknown> = {
      level1: {
        level2: {
          level3: {
            a: 1,
            b: 2,
          },
        },
      },
    };

    const source: Record<string, unknown> = {
      level1: {
        level2: {
          level3: {
            b: 3,
            c: 4,
          },
          level3b: {
            x: 1,
          },
        },
      },
    };

    expect(deepMerge(target, source)).toEqual({
      level1: {
        level2: {
          level3: {
            a: 1,
            b: 3,
            c: 4,
          },
          level3b: {
            x: 1,
          },
        },
      },
    });
  });

  it("should handle arrays at different levels", () => {
    const target: Record<string, unknown> = {
      topArray: [1, 2, 3],
      nested: {
        nestedArray: ["a", "b"],
      },
    };

    const source: Record<string, unknown> = {
      topArray: [4, 5],
      nested: {
        nestedArray: ["c", "d", "e"],
      },
    };

    expect(deepMerge(target, source)).toEqual({
      topArray: [4, 5],
      nested: {
        nestedArray: ["c", "d", "e"],
      },
    });
  });

  it("should handle mixed array and object values", () => {
    const target: Record<string, unknown> = {
      prop: [1, 2, 3],
    };

    const source: Record<string, unknown> = {
      prop: { key: "value" },
    };

    expect(deepMerge(target, source)).toEqual({
      prop: { key: "value" },
    });
  });

  it("should handle object to array replacement", () => {
    const target: Record<string, unknown> = {
      prop: { key: "value" },
    };

    const source: Record<string, unknown> = {
      prop: [1, 2, 3],
    };

    expect(deepMerge(target, source)).toEqual({
      prop: [1, 2, 3],
    });
  });

  it("should handle null to object merge", () => {
    const target: Record<string, unknown> = {
      prop: null,
    };

    const source: Record<string, unknown> = {
      prop: { key: "value" },
    };

    expect(deepMerge(target, source)).toEqual({
      prop: { key: "value" },
    });
  });

  it("should handle object to null replacement", () => {
    const target: Record<string, unknown> = {
      prop: { key: "value" },
    };

    const source: Record<string, unknown> = {
      prop: null,
    };

    expect(deepMerge(target, source)).toEqual({
      prop: null,
    });
  });

  it("should skip inherited properties", () => {
    // Create an object with inherited properties using Object.create
    const proto = { inherited: "base" };
    const source = Object.create(proto);
    source.own = "source";

    const target: Record<string, unknown> = { a: 1 };

    const result = deepMerge(
      target,
      source as unknown as Record<string, unknown>,
    );
    expect(result).toEqual({ a: 1, own: "source" });
    expect(result).not.toHaveProperty("inherited");
  });

  it("should handle complex real-world scenario", () => {
    const defaultSettings: Record<string, unknown> = {
      theme: "light",
      features: {
        experimental: false,
        beta: false,
      },
      ui: {
        sidebar: "expanded",
        toolbar: {
          visible: true,
          position: "top",
        },
      },
    };

    const userSettings: Record<string, unknown> = {
      theme: "dark",
      features: {
        experimental: true,
      },
      ui: {
        toolbar: {
          position: "bottom",
        },
      },
    };

    const result = deepMerge(defaultSettings, userSettings);

    expect(result).toEqual({
      theme: "dark",
      features: {
        experimental: true,
        beta: false,
      },
      ui: {
        sidebar: "expanded",
        toolbar: {
          visible: true,
          position: "bottom",
        },
      },
    });
  });

  it("should handle sources with different structures", () => {
    const target: Record<string, unknown> = {
      a: {
        b: {
          c: 1,
        },
      },
    };

    const source1: Record<string, unknown> = {
      a: {
        d: 2,
      },
    };

    const source2: Record<string, unknown> = {
      a: {
        b: {
          e: 3,
        },
      },
    };

    expect(deepMerge(target, source1, source2)).toEqual({
      a: {
        b: {
          c: 1,
          e: 3,
        },
        d: 2,
      },
    });
  });

  it("should return target when no sources provided", () => {
    const target: Record<string, unknown> = { a: 1, b: 2 };
    const result = deepMerge(target);

    expect(result).toEqual(target);
    expect(result).not.toBe(target); // Should be a copy
  });
});
