import { mapWithDefaults } from "../mapWithDefaults";

describe("mapWithDefaults", () => {
  interface Input {
    x: number;
    y?: string;
  }

  type Output = {
    value: number;
    label: string;
  };

  it("should create a mapper that applies defaults to output", () => {
    const mapper = (input: Input): Output => ({
      value: input.x * 2,
      label: input.y || "no label",
    });

    const defaults: Output = { value: 0, label: "default" };
    const mappedFn = mapWithDefaults(mapper, defaults);

    const result = mappedFn({ x: 5 });

    expect(result).toEqual({ value: 10, label: "no label" });
  });

  it("should handle partial inputs correctly", () => {
    const mapper = (input: { a?: number; b?: string }): { result: string } => ({
      result: `${input.a || 0}-${input.b || "empty"}`,
    });

    const defaults = { result: "default-result" };
    const mappedFn = mapWithDefaults(mapper, defaults);

    const result = mappedFn({ a: 5 });

    expect(result).toEqual({ result: "5-empty" });
  });

  it("should apply output defaults when mapper returns partial result", () => {
    const mapper = (input: {
      name: string;
    }): Partial<{ name: string; status: string }> => ({
      name: input.name.toUpperCase(),
      // status intentionally missing
    });

    const defaults = { name: "Unknown", status: "active" };
    const mappedFn = mapWithDefaults(mapper, defaults);

    const result = mappedFn({ name: "john" });

    expect(result).toEqual({ name: "JOHN", status: "active" });
  });

  it("should handle empty input with mapper that handles undefined fields", () => {
    const mapper = (input: { value?: number }): { doubled: number } => ({
      doubled: (input.value || 0) * 2,
    });

    const defaults = { doubled: -1 };
    const mappedFn = mapWithDefaults(mapper, defaults);

    const result = mappedFn({});

    expect(result).toEqual({ doubled: 0 });
  });
});
