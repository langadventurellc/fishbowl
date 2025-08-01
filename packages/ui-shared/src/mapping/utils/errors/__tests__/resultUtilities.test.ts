import { unwrapResult, getOrDefault } from "../index";
import { MappingResult } from "../MappingResult";
import { createMappingError } from "../createMappingError";

describe("Result Utilities", () => {
  describe("unwrapResult", () => {
    it("should return data from successful result", () => {
      const result: MappingResult<string> = {
        success: true,
        data: "hello world",
      };

      expect(unwrapResult(result)).toBe("hello world");
    });

    it("should return complex data from successful result", () => {
      const data = { name: "John", age: 30, hobbies: ["reading", "coding"] };
      const result: MappingResult<typeof data> = { success: true, data };

      expect(unwrapResult(result)).toEqual(data);
      expect(unwrapResult(result)).toBe(data);
    });

    it("should throw MappingError from failed result", () => {
      const error = createMappingError("Test error", "field", "value");
      const result: MappingResult<string> = { success: false, error };

      expect(() => unwrapResult(result)).toThrow(error);
      expect(() => unwrapResult(result)).toThrow("Test error");
    });

    it("should preserve error properties when throwing", () => {
      const originalError = new Error("Original");
      const error = createMappingError(
        "Mapping failed",
        "username",
        "invalid",
        originalError,
      );
      const result: MappingResult<string> = { success: false, error };

      try {
        unwrapResult(result);
        expect(true).toBe(false); // Should not reach here
      } catch (thrownError) {
        expect(thrownError).toBe(error);
        expect((thrownError as typeof error).field).toBe("username");
        expect((thrownError as typeof error).value).toBe("invalid");
        expect((thrownError as typeof error).cause).toBe(originalError);
      }
    });
  });

  describe("getOrDefault", () => {
    it("should return data from successful result", () => {
      const result: MappingResult<number> = { success: true, data: 42 };

      expect(getOrDefault(result, 0)).toBe(42);
    });

    it("should return default value from failed result", () => {
      const result: MappingResult<number> = {
        success: false,
        error: createMappingError("Failed"),
      };

      expect(getOrDefault(result, 99)).toBe(99);
    });

    it("should work with different data types", () => {
      const stringResult: MappingResult<string> = {
        success: true,
        data: "success",
      };
      const failedStringResult: MappingResult<string> = {
        success: false,
        error: createMappingError("Failed"),
      };

      expect(getOrDefault(stringResult, "default")).toBe("success");
      expect(getOrDefault(failedStringResult, "default")).toBe("default");
    });

    it("should work with complex object types", () => {
      const data = { name: "John", scores: [95, 87, 92] };
      const defaultData = { name: "Unknown", scores: [] };

      const successResult: MappingResult<typeof data> = { success: true, data };
      const failedResult: MappingResult<typeof data> = {
        success: false,
        error: createMappingError("Processing failed"),
      };

      expect(getOrDefault(successResult, defaultData)).toBe(data);
      expect(getOrDefault(failedResult, defaultData)).toBe(defaultData);
    });

    it("should handle null and undefined defaults", () => {
      const failedResult: MappingResult<string | null> = {
        success: false,
        error: createMappingError("Failed"),
      };

      expect(getOrDefault(failedResult, null)).toBeNull();

      const failedUndefinedResult: MappingResult<string | undefined> = {
        success: false,
        error: createMappingError("Failed"),
      };

      expect(getOrDefault(failedUndefinedResult, undefined)).toBeUndefined();
    });
  });
});
