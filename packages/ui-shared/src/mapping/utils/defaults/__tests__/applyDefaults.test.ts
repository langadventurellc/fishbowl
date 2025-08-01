import { applyDefaults } from "../applyDefaults";

describe("applyDefaults", () => {
  it("should apply defaults to missing fields", () => {
    const defaults = { a: 1, b: "default", c: true };
    const partial = { a: 2 };

    const result = applyDefaults(partial, defaults);

    expect(result).toEqual({ a: 2, b: "default", c: true });
  });

  it("should override all default values with provided values", () => {
    const defaults = { a: 1, b: "default", c: true };
    const partial = { a: 10, b: "custom", c: false };

    const result = applyDefaults(partial, defaults);

    expect(result).toEqual(partial);
  });

  it("should handle empty partial object", () => {
    const defaults = { a: 1, b: "default" };
    const partial = {};

    const result = applyDefaults(partial, defaults);

    expect(result).toEqual(defaults);
  });

  it("should handle nested objects correctly", () => {
    const defaults = { a: 1, nested: { x: 10, y: 20 } };
    const partial: Partial<typeof defaults> = {
      nested: { x: 30 } as typeof defaults.nested,
    };

    const result = applyDefaults(partial, defaults);

    // Note: shallow merge, nested object is replaced
    expect(result).toEqual({ a: 1, nested: { x: 30 } });
  });

  it("should prevent prototype pollution", () => {
    const malicious = JSON.parse('{"__proto__": {"polluted": true}}');
    const defaults = { safe: "value" };

    const result = applyDefaults(malicious, defaults);

    expect(
      (Object.prototype as Record<string, unknown>).polluted,
    ).toBeUndefined();
    expect(result).toEqual({ safe: "value" });
  });

  it("should handle null values in partial", () => {
    const defaults = { a: 1, b: "default" };
    const partial: Partial<{ a: number | null; b: string }> = { a: null };

    const result = applyDefaults(partial, defaults);

    expect(result).toEqual({ a: null, b: "default" });
  });

  it("should handle undefined values in partial", () => {
    const defaults = { a: 1, b: "default" };
    const partial: Partial<typeof defaults> = { a: undefined };

    const result = applyDefaults(partial, defaults);

    expect(result).toEqual({ a: undefined, b: "default" });
  });
});
