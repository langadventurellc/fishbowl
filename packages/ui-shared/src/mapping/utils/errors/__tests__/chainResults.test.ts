import { chainResults } from "../chainResults";
import { MappingResult } from "../MappingResult";
import { createMappingError } from "../createMappingError";
import { isSuccess, isError } from "../index";

describe("chainResults", () => {
  const parseNumber = (s: string): MappingResult<number> => {
    const num = parseInt(s, 10);
    return isNaN(num)
      ? {
          success: false,
          error: createMappingError("Invalid number", "input", s),
        }
      : { success: true, data: num };
  };

  const multiplyBy2 = (n: number): MappingResult<number> => ({
    success: true,
    data: n * 2,
  });

  const ensurePositive = (n: number): MappingResult<number> =>
    n > 0
      ? { success: true, data: n }
      : {
          success: false,
          error: createMappingError("Must be positive", "value", n),
        };

  it("should chain successful operations", () => {
    const chained = chainResults(parseNumber, multiplyBy2);
    const result = chained("5");

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe(10);
    }
  });

  it("should stop on first operation error", () => {
    const chained = chainResults(parseNumber, multiplyBy2);
    const result = chained("invalid");

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Invalid number");
      expect(result.error.field).toBe("input");
      expect(result.error.value).toBe("invalid");
    }
  });

  it("should propagate second operation error", () => {
    const failingSecond = (_: number): MappingResult<number> => ({
      success: false,
      error: createMappingError(
        "Second operation failed",
        "operation",
        "multiply",
      ),
    });

    const chained = chainResults(parseNumber, failingSecond);
    const result = chained("5");

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Second operation failed");
      expect(result.error.field).toBe("operation");
      expect(result.error.value).toBe("multiply");
    }
  });

  it("should work with three chained operations", () => {
    const step1 = chainResults(parseNumber, multiplyBy2);
    const step2 = chainResults(step1, ensurePositive);

    const result = step2("5");

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe(10);
    }
  });

  it("should fail three-step chain on third step", () => {
    const step1 = chainResults(parseNumber, multiplyBy2);
    const step2 = chainResults(step1, ensurePositive);

    const result = step2("-5");

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Must be positive");
      expect(result.error.value).toBe(-10);
    }
  });

  it("should work with different types through the chain", () => {
    const parseToNumber = (s: string): MappingResult<number> => {
      const num = parseFloat(s);
      return isNaN(num)
        ? { success: false, error: createMappingError("Not a number") }
        : { success: true, data: num };
    };

    const numberToString = (n: number): MappingResult<string> => ({
      success: true,
      data: n.toFixed(2),
    });

    const chained = chainResults(parseToNumber, numberToString);
    const result = chained("3.14159");

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe("3.14");
    }
  });

  it("should handle complex input/output types", () => {
    const extractName = (user: { name?: string }): MappingResult<string> =>
      user.name
        ? { success: true, data: user.name }
        : { success: false, error: createMappingError("Missing name") };

    const toUpperCase = (s: string): MappingResult<string> => ({
      success: true,
      data: s.toUpperCase(),
    });

    const chained = chainResults(extractName, toUpperCase);

    const validUser = { name: "john doe" };
    const result = chained(validUser);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe("JOHN DOE");
    }

    const invalidUser = {};
    const errorResult = chained(invalidUser);

    expect(isError(errorResult)).toBe(true);
    if (isError(errorResult)) {
      expect(errorResult.error.message).toBe("Missing name");
    }
  });
});
