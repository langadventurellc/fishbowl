import { validateAndMap } from "../validateAndMap";
import { isSuccess, isError } from "../index";

describe("validateAndMap", () => {
  const isPositiveNumber = (input: unknown): input is number =>
    typeof input === "number" && input > 0;

  const doubleNumber = (n: number) => n * 2;

  it("should map valid input successfully", () => {
    const mapper = validateAndMap(isPositiveNumber, doubleNumber);
    const result = mapper(5);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe(10);
    }
  });

  it("should fail validation for invalid input", () => {
    const mapper = validateAndMap(isPositiveNumber, doubleNumber);
    const result = mapper(-5);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Validation failed");
      expect(result.error.value).toBe(-5);
    }
  });

  it("should fail validation for wrong type", () => {
    const mapper = validateAndMap(isPositiveNumber, doubleNumber);
    const result = mapper("not a number");

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Validation failed");
      expect(result.error.value).toBe("not a number");
    }
  });

  it("should handle mapper errors after successful validation", () => {
    const throwingMapper = (_: number) => {
      throw new Error("Mapper failed");
    };
    const mapper = validateAndMap(isPositiveNumber, throwingMapper);
    const result = mapper(5);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Mapper failed");
      expect(result.error.value).toBe(5);
      expect(result.error.cause).toBeInstanceOf(Error);
    }
  });

  it("should handle non-Error throws in mapper", () => {
    const throwingMapper = (_: number) => {
      throw "String error";
    };
    const mapper = validateAndMap(isPositiveNumber, throwingMapper);
    const result = mapper(5);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Mapping failed");
      expect(result.error.value).toBe(5);
    }
  });

  it("should work with complex validation", () => {
    interface User {
      name: string;
      age: number;
    }

    const isValidUser = (input: unknown): input is User =>
      typeof input === "object" &&
      input !== null &&
      typeof (input as User).name === "string" &&
      typeof (input as User).age === "number" &&
      (input as User).age >= 0;

    const formatUser = (user: User) => `${user.name} (${user.age} years old)`;

    const mapper = validateAndMap(isValidUser, formatUser);

    const validUser = { name: "John", age: 30 };
    const result = mapper(validUser);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe("John (30 years old)");
    }
  });

  it("should reject invalid complex objects", () => {
    interface User {
      name: string;
      age: number;
    }

    const isValidUser = (input: unknown): input is User =>
      typeof input === "object" &&
      input !== null &&
      typeof (input as User).name === "string" &&
      typeof (input as User).age === "number" &&
      (input as User).age >= 0;

    const formatUser = (user: User) => `${user.name} (${user.age} years old)`;

    const mapper = validateAndMap(isValidUser, formatUser);

    const invalidUser = { name: "John", age: -5 };
    const result = mapper(invalidUser);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Validation failed");
      expect(result.error.value).toBe(invalidUser);
    }
  });

  it("should handle null and undefined inputs", () => {
    const mapper = validateAndMap(isPositiveNumber, doubleNumber);

    const nullResult = mapper(null);
    expect(isError(nullResult)).toBe(true);

    const undefinedResult = mapper(undefined);
    expect(isError(undefinedResult)).toBe(true);
  });
});
