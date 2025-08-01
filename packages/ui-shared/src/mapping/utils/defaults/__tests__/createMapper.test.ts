import { createMapper } from "../createMapper";

describe("createMapper", () => {
  interface UserInput {
    name: string;
    age: number;
  }

  interface UserOutput {
    displayName: string;
    isAdult: boolean;
  }

  it("should create a safe mapper with successful mapping", () => {
    const mapperFn = (input: UserInput): UserOutput => ({
      displayName: input.name.toUpperCase(),
      isAdult: input.age >= 18,
    });

    const safeMapper = createMapper(mapperFn);
    const result = safeMapper({ name: "John", age: 25 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ displayName: "JOHN", isAdult: true });
    }
  });

  it("should handle validation failure", () => {
    const mapperFn = (input: UserInput): UserOutput => ({
      displayName: input.name.toUpperCase(),
      isAdult: input.age >= 18,
    });

    const validator = (input: UserInput): boolean =>
      input.age > 0 && input.age < 150;

    const safeMapper = createMapper(mapperFn, validator);
    const result = safeMapper({ name: "Invalid", age: -5 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Input validation failed");
    }
  });

  it("should handle mapping errors", () => {
    const mapperFn = (input: {
      name: string | null;
      age: number;
    }): UserOutput => {
      // This will throw when name is null
      return {
        displayName: input.name!.toUpperCase(),
        isAdult: input.age >= 18,
      };
    };

    const safeMapper = createMapper(mapperFn);
    const result = safeMapper({ name: null, age: 25 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Cannot read");
    }
  });

  it("should pass validation and map successfully", () => {
    const mapperFn = (input: { value: number }): { doubled: number } => ({
      doubled: input.value * 2,
    });

    const validator = (input: { value: number }): boolean => input.value >= 0;

    const safeMapper = createMapper(mapperFn, validator);
    const result = safeMapper({ value: 5 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ doubled: 10 });
    }
  });

  it("should work without validator", () => {
    const mapperFn = (input: string): { length: number } => ({
      length: input.length,
    });

    const safeMapper = createMapper(mapperFn);
    const result = safeMapper("hello");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ length: 5 });
    }
  });

  it("should handle non-Error exceptions", () => {
    const mapperFn = (): never => {
      throw "string error";
    };

    const safeMapper = createMapper(mapperFn);
    const result = safeMapper({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Mapping failed");
    }
  });

  it("should preserve original error in cause field", () => {
    const originalError = new Error("Original error");
    const mapperFn = (): never => {
      throw originalError;
    };

    const safeMapper = createMapper(mapperFn);
    const result = safeMapper({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.cause).toBe(originalError);
    }
  });
});
