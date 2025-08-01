import { isSuccess, isError } from "../index";
import { MappingResult } from "../MappingResult";
import { createMappingError } from "../createMappingError";

describe("Type Guards", () => {
  describe("isSuccess", () => {
    it("should return true for successful result", () => {
      const result: MappingResult<number> = { success: true, data: 42 };

      expect(isSuccess(result)).toBe(true);
    });

    it("should return false for error result", () => {
      const result: MappingResult<number> = {
        success: false,
        error: createMappingError("Failed"),
      };

      expect(isSuccess(result)).toBe(false);
    });

    it("should narrow type correctly in if statement", () => {
      const result: MappingResult<string> = { success: true, data: "hello" };

      if (isSuccess(result)) {
        // TypeScript should know result.data is string
        expect(result.data.toUpperCase()).toBe("HELLO");
      } else {
        expect(true).toBe(false); // Should not reach this branch
      }
    });
  });

  describe("isError", () => {
    it("should return true for error result", () => {
      const result: MappingResult<number> = {
        success: false,
        error: createMappingError("Failed"),
      };

      expect(isError(result)).toBe(true);
    });

    it("should return false for successful result", () => {
      const result: MappingResult<number> = { success: true, data: 42 };

      expect(isError(result)).toBe(false);
    });

    it("should narrow type correctly in if statement", () => {
      const result: MappingResult<string> = {
        success: false,
        error: createMappingError("Test error", "field", "value"),
      };

      if (isError(result)) {
        // TypeScript should know result.error is MappingError
        expect(result.error.message).toBe("Test error");
        expect(result.error.field).toBe("field");
        expect(result.error.value).toBe("value");
      } else {
        expect(true).toBe(false); // Should not reach this branch
      }
    });
  });

  describe("Type guard combination", () => {
    it("should be mutually exclusive", () => {
      const successResult: MappingResult<number> = { success: true, data: 42 };
      const errorResult: MappingResult<number> = {
        success: false,
        error: createMappingError("Error"),
      };

      expect(isSuccess(successResult)).toBe(true);
      expect(isError(successResult)).toBe(false);

      expect(isSuccess(errorResult)).toBe(false);
      expect(isError(errorResult)).toBe(true);
    });
  });
});
